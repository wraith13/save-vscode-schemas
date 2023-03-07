import * as vscode from 'vscode';
import { posix } from 'path';
import config from './config.json';
export const locale = vscode.env.language ?? "en";
export const version = `v${vscode.version}`;
export const activate = (context: vscode.ExtensionContext) => context.subscriptions.push
(
    vscode.commands.registerCommand
    (
        'save-vscode-schemas',
        async () =>
        {
            const baseUri = vscode.workspace.workspaceFolders?.[0].uri;
            if (baseUri)
            {
                await Promise.all
                (
                    config.schemas.map
                    (
                        async uri =>
                        {
                            const path = `${config.out.rootDir}/${locale}/${version}${uri.replace(/^vscode:\/(.*)/,"$1.json")}`;
                            await vscode.workspace.fs.createDirectory
                            (
                                baseUri.with({ path: posix.join(baseUri.path, path.replace(/\/[^/]+$/, "")) })
                            );
                            await vscode.workspace.fs.writeFile
                            (
                                baseUri.with({ path: posix.join(baseUri.path, path) }),
                                Buffer.from
                                (
                                    JSON.stringify
                                    (
                                        JSON.parse((await vscode.workspace.openTextDocument(vscode.Uri.parse(uri))).getText()),
                                        config.out.stringifyOptions.replacer,
                                        config.out.stringifyOptions.space
                                    ),
                                    "utf8"
                                )
                            );
                        }
                    )
                );
            }
        }
    )
);
export const deactivate = () => { };
