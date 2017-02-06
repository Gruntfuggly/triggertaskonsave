// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require( 'vscode' ),
    path = require( 'path' ),
    fs = require( 'fs' );

function activate()
{
    'use strict';
    vscode.workspace.onDidSaveTextDocument( function( document )
    {
        var onFormat = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).on;
        if( onFormat !== true )
        {
            return;
        }

        var taskFilePath = path.join( vscode.workspace.rootPath, '.vscode', 'tasks.json' );
        var rawTaskFileContents = fs.readFileSync( taskFilePath, 'utf8' );
        var taskFileContents = rawTaskFileContents.replace( /((\/\/|\/\/\/)(.*)(\r\n|\r|\n))|((\/\*)((\D|\d)+)(\*\/))/gi, "" );
        var taskFileTasks = JSON.parse( taskFileContents );

        if( taskFileTasks.tasks === undefined )
        {
            vscode.window.showErrorMessage( "[Trigger Task on Save] No tasks defined" );
            return;
        }

        var availableTasks = [];

        taskFileTasks.tasks.map( function( task )
        {
            availableTasks.push( task.taskName );
        });

        var tasks = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).tasks;

        function checkTask( taskName )
        {
            tasks[ taskName ].map( function( extension )
            {
                var pattern = "." + extension + "$";
                var match = pattern.length > 0 && new RegExp( pattern ).test( document.fileName );
                if( match )
                {
                    if( availableTasks.indexOf( taskName ) === -1 )
                    {
                        vscode.window.showErrorMessage( '[Trigger Task on Save] Task not found: ' + taskName );
                    }
                    else
                    {
                        vscode.window.showInformationMessage( "[Trigger Task on Save] Running task: " + taskName );
                        vscode.commands.executeCommand( 'workbench.action.tasks.' + taskName );
                    }
                }
            });
        }

        for( var taskName in tasks )
        {
            if( tasks.hasOwnProperty( taskName ) )
            {
                checkTask( taskName );
            }
        }
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate()
{
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map