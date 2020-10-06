namespace MF.Tuc.Extension

open System
open Fable.Core
open Fable.Core.JsInterop
open Fable.Import
open Fable.Import.vscode
open Fable.Import.Node
open Ionide.VSCode.Helpers

open DTO
open LanguageServer

module LanguageService =
    let [<Literal>] private TucLanguageShortName = "tuc"
    let [<Literal>] private TucLanguageName = "TypedUseCase"

    let mutable client : LanguageClient option = None

    let private createClient opts =
        let options =
            createObj [
                "run" ==> opts
                "debug" ==> opts
                ] |> unbox<ServerOptions>

        let fileDeletedWatcher = workspace.createFileSystemWatcher("**/*.{tuc}", true, true, false)  // todo - add fs,fsx ?

        let clientOpts =
            let opts = createEmpty<Client.LanguageClientOptions>
            let selector =
                createObj [
                    "language" ==> TucLanguageShortName
                ] |> unbox<Client.DocumentSelector>

            let initOpts =
                createObj [
                    "AutomaticWorkspaceInit" ==> false
                ]

            let synch = createEmpty<Client.SynchronizeOptions>
            synch.configurationSection <- Some !^TucLanguageName
            synch.fileEvents <- Some( !^ ResizeArray([fileDeletedWatcher]))

            opts.documentSelector <- Some !^selector
            opts.synchronize <- Some synch
            opts.revealOutputChannelOn <- Some Client.RevealOutputChannelOn.Never


            opts.initializationOptions <- Some !^(Some initOpts)

            opts

        let cl = LanguageClient(TucLanguageName, TucLanguageShortName, options, clientOpts, false)
        client <- Some cl
        cl

    let private readyClient (cl: LanguageClient) =
        cl.onReady ()
        |> Promise.onSuccess (fun _ ->
            cl.onNotification("fsharp/notifyWorkspace", (fun (a: Types.PlainNotification) ->
                match Notifications.notifyWorkspaceHandler with
                | None -> ()
                | Some cb ->
                    let onMessage res =
                        match res?Kind |> unbox with
                        | "project" ->
                            res |> unbox<ProjectResult> |> deserializeProjectResult |> Choice1Of4 |> cb
                        | "projectLoading" ->
                            res |> unbox<ProjectLoadingResult> |> Choice2Of4 |> cb
                        | "error" ->
                            res?Data |> parseError |> Choice3Of4 |> cb
                        | "workspaceLoad" ->
                            res?Data?Status |> unbox<string> |> Choice4Of4 |> cb
                        | _ ->
                            ()
                    let res = a.content |> ofJson<obj>
                    onMessage res
            ))

            cl.onNotification("fsharp/fileParsed", (fun (a: Types.PlainNotification) ->
                let fn = a.content
                let te = window.visibleTextEditors |> Seq.find (fun n -> path.normalize(n.document.fileName).ToLower() = path.normalize(fn).ToLower())

                let ev = {Notifications.fileName = a.content; Notifications.version = te.document.version; Notifications.document = te.document }

                Notifications.onDocumentParsedEmitter.fire ev

                ()
            ))
        )

    let start (c : ExtensionContext) =
        promise {
            let! startOpts = getOptions ()
            let cl = createClient startOpts
            c.subscriptions.Add (cl.start ())
            let! _ = readyClient cl

            return ()

        }

    let stop () =
        promise {
            match client with
            | Some cl -> return! cl.stop()
            | None -> return ()
        }
