// add the following line for intellisense
/// <reference path="../../vscode.d.ts" />

var vscode = require( 'vscode' );
var path = require( 'path' );
var minimatch = require( 'minimatch' );

var currentTaskExecution;
var restartTask;

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

function expandGlob( glob, uri )
{
    var envRegex = new RegExp( "\\$\\{(.*?)\\}", "g" );
    glob = glob.replace( envRegex, function( match, name )
    {
        if( name === "workspaceFolder" )
        {
            return vscode.workspace.getWorkspaceFolder( uri ).uri.path;
        }
        return process.env[ name ];
    } );

    return glob;
}

function activate( context )
{
    'use strict';

    var busyIndicator = vscode.window.createStatusBarItem( vscode.StatusBarAlignment.Right, 0 );

    function showBusyIndicator( taskName )
    {
        busyIndicator.tooltip = "Running task " + taskName + "...";
        busyIndicator.text = "$(sync~spin) " + taskName;
        busyIndicator.show();
    }

    context.subscriptions.push( vscode.tasks.onDidEndTask( function( endEvent )
    {
        currentTaskExecution = undefined;

        busyIndicator.hide();

        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'showNotifications' ) === true )
        {
            vscode.window.showInformationMessage( "Task '" + endEvent.execution.task.name + "' finished" );
        }

        if( restartTask !== undefined )
        {
            vscode.tasks.executeTask( restartTask );
            restartTask = undefined;
        }
    } ) );

    context.subscriptions.push( vscode.tasks.onDidStartTask( function( startEvent )
    {
        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'showBusyIndicator' ) === true )
        {
            showBusyIndicator( startEvent.execution.task.name );
        }
        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'showNotifications' ) === true )
        {
            vscode.window.showInformationMessage( "Task '" + startEvent.execution.task.name + "' started" );
        }
    } ) );

    context.subscriptions.push( vscode.workspace.onDidSaveTextDocument( function( document )
    {
        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'on' ) === true )
        {
            var current = vscode.tasks.taskExecutions;
            vscode.tasks.fetchTasks().then( function( availableTasks )
            {
                var tasks = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).tasks;

                function checkTask( taskName )
                {
                    tasks[ taskName ].map( function( glob )
                    {
                        glob = expandGlob( glob, document.uri );

                        var filePath = path.isAbsolute( glob ) ? document.fileName : vscode.workspace.asRelativePath( document.fileName );

                        if( minimatch( filePath, glob, { matchBase: true } ) )
                        {
                            var found = false;
                            availableTasks.map( function( task )
                            {
                                if( task.name === taskName )
                                {
                                    current.map( function( e )
                                    {
                                        if( e.task._id === task._id )
                                        {
                                            currentTaskExecution = e;
                                        }
                                    } );
                                    found = true;

                                    if( currentTaskExecution !== undefined && vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'restart' ) === true )
                                    {
                                        currentTaskExecution.terminate();
                                        restartTask = task;
                                    }
                                    else
                                    {
                                        vscode.tasks.executeTask( task );
                                    }
                                }
                            } );
                            if( found === false )
                            {
                                vscode.window.showErrorMessage( "Task not found: " + taskName );
                                return false;
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
        }
    } ) );

    context.subscriptions.push(
        vscode.commands.registerCommand( 'triggerTaskOnSave.enable', enable ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.disable', disable ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.toggle', toggle ) );
}

function deactivate()
{
    currentTaskExecution = undefined;
    restartTask = undefined;
}

exports.activate = activate;
exports.deactivate = deactivate;

//# sourceMappingURL=extension.js.map
