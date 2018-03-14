// add the following line for intellisense
/// <reference path="../../vscode.d.ts" />

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require( 'vscode' ),
    path = require( 'path' ),
    fs = require( 'fs' ),
    minimatch = require( 'minimatch' ),
    jsonlint = require( 'json-lint' );

function enable()
{
    vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).update( 'on', true, true );
    vscode.window.setStatusBarMessage( "Trigger Task On Save Enabled", 1000 );
}
function disable()
{
    vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).update( 'on', false, true );
    vscode.window.setStatusBarMessage( "Trigger Task On Save Disabled", 1000 );
}
function toggle()
{
    if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'on' ) )
    {
        disable();
    }
    else
    {
        enable();
    }
}

function activate( context )
{
    'use strict';
    vscode.workspace.onDidSaveTextDocument( function( document )
    {
        var onFormat = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).on;
        var editor = vscode.window.activeTextEditor;
        if( onFormat !== true || ! editor )
        {
            return;
        }

        var workspace = vscode.workspace.getWorkspaceFolder( editor.document.uri );
        if( !workspace )
        {
            return;
        }

        var rootPath = workspace.uri.fsPath;

        var taskFilePath = path.join( rootPath, '.vscode', 'tasks.json' );
        var taskFileTasks = {};
        var rawTaskFileContents;
        try
        {
            rawTaskFileContents = fs.readFileSync( taskFilePath, 'utf8' );
        }
        catch( e )
        {
            return;
        }

        var taskFileContents = rawTaskFileContents.replace( /((\/\/|\/\/\/)(.*)(\r\n|\r|\n))|((\/\*)((\D|\d)+)(\*\/))/gi, "" );
        try
        {
            taskFileTasks = JSON.parse( taskFileContents );
        }
        catch( e )
        {
            var lint = jsonlint( rawTaskFileContents );
            vscode.window.showErrorMessage("Failed to read tasks.json: " + e );
            vscode.window.showErrorMessage("Failed to read tasks.json: " + lint.error + " at line " + lint.line + ", character " + lint.character);
        }

        if( taskFileTasks.tasks === undefined )
        {
            return;
        }

        var availableTasks = [];

        taskFileTasks.tasks.map( function( task )
        {
            if( task.label )
            {
                availableTasks.push( task.label );
            }
            else if( task.taskName )
            {
                availableTasks.push( task.taskName );
            }
        } );

        var tasks = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).tasks;

        function checkTask( taskName )
        {
            tasks[ taskName ].map( function( glob )
            {
                // get file relative in the project
                let filePath = vscode.workspace.asRelativePath( document.fileName );
                if( minimatch( filePath, glob, { matchBase: true } ) )
                {
                    if( availableTasks.indexOf( taskName ) === -1 )
                    {
                        vscode.window.showErrorMessage( "[Trigger Task on Save] Task not found: " + taskName );
                        return false;
                    }
                    else
                    {
                        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).restart )
                        {
                            vscode.commands.executeCommand( 'workbench.action.tasks.terminate' ).then( function()
                            {
                                vscode.commands.executeCommand( 'workbench.action.tasks.runTask', taskName );
                            } );
                        }
                        else
                        {
                            vscode.commands.executeCommand( 'workbench.action.tasks.runTask', taskName );
                        }
                    }
                }
            } );
        }

        for( var taskName in tasks )
        {
            if( tasks.hasOwnProperty( taskName ) )
            {
                checkTask( taskName );
            }
        }
    } );

    context.subscriptions.push(
        vscode.commands.registerCommand( 'triggerTaskOnSave.enable', enable ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.disable', disable ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.toggle', toggle ) );
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate()
{
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map