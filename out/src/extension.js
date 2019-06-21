// add the following line for intellisense
/// <reference path="../../vscode.d.ts" />

var vscode = require( 'vscode' );
var path = require( 'path' );
var minimatch = require( 'minimatch' );

function activate( context )
{
    'use strict';

    var currentTaskExecution;
    var restartTask;

    var busyIndicator = vscode.window.createStatusBarItem( vscode.StatusBarAlignment.Right, 9500 );
    var selectedTaskIndicator = vscode.window.createStatusBarItem( vscode.StatusBarAlignment.Right, 9500 );

    var outputChannel = vscode.window.createOutputChannel( 'Trigger Task On Save' );

    var startedTasks = {};

    function log( text )
    {
        outputChannel.appendLine( new Date().toLocaleTimeString() + " " + text );
    }

    function showBusyIndicator( taskName )
    {
        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'selectedTask' ) )
        {
            selectedTaskIndicator.tooltip = "Click to terminate...";
            selectedTaskIndicator.text = "$(sync~spin) " + taskName;
            selectedTaskIndicator.command = "triggerTaskOnSave.stopCurrentTask"
        }
        else
        {
            busyIndicator.tooltip = "Click to terminate...";
            busyIndicator.text = "$(sync~spin) " + taskName;
            busyIndicator.command = "triggerTaskOnSave.stopCurrentTask"
            busyIndicator.show();
        }
    }

    function showSelectedTask()
    {
        var taskName = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'selectedTask' );

        if( taskName )
        {
            selectedTaskIndicator.tooltip = "Click to clear selected task...";
            selectedTaskIndicator.text = "$(star)" + taskName;
            selectedTaskIndicator.command = "triggerTaskOnSave.clearSelectedTask";
            selectedTaskIndicator.show();
        }
        else
        {
            selectedTaskIndicator.hide();
        }
    }

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

    function selectTask()
    {
        vscode.tasks.fetchTasks().then( function( availableTasks )
        {
            var taskList = [];
            availableTasks.map( function( task )
            {
                taskList.push( task.name );
            } );

            vscode.window.showQuickPick( taskList, { matchOnDetail: true, matchOnDescription: true, placeHolder: "Select task..." } ).then( function( taskName )
            {
                if( taskName )
                {
                    vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).update( 'selectedTask', taskName, false ).then( function()
                    {
                        vscode.window.showInformationMessage( "Selected task: " + taskName );
                        showSelectedTask();
                    } );
                }
            } );
        } );
    }

    function clearSelectedTask()
    {
        vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).update( 'selectedTask', undefined, false ).then( function()
        {
            vscode.window.showInformationMessage( "Selected task cleared" );
            showSelectedTask();
        } );
    }

    function stopCurrentTask()
    {
        if( currentTaskExecution !== undefined )
        {
            log( "stopCurrentTask: terminating " + currentTaskExecution.task.name );
            currentTaskExecution.terminate();
            showSelectedTask();
        }
    }

    function expandGlob( glob, uri )
    {
        var envRegex = new RegExp( "\\$\\{(.*?)\\}", "g" );
        glob = glob.replace( envRegex, function( match, name )
        {
            if( name === "workspaceFolder" )
            {
                var folder = vscode.workspace.getWorkspaceFolder( uri );
                return folder ? folder.uri.path : vscode.workspace.workspaceFolders[ 0 ].uri.fsPath;
            }
            return process.env[ name ];
        } );

        return glob;
    }

    function findAndRunTask( availableTasks, taskName )
    {
        var found = false;

        availableTasks.map( function( task )
        {
            if( task.name === taskName )
            {
                found = true;

                if( currentTaskExecution !== undefined && vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'restart' ) === true )
                {
                    log( "findAndRunTask: terminating " + currentTaskExecution.task.name );
                    currentTaskExecution.terminate();
                    restartTask = task;
                }
                else
                {
                    if( startedTasks[ taskName ] === undefined )
                    {
                        startedTasks[ taskName ] = true;

                        log( "findAndRunTask: executing " + task.name );
                        vscode.tasks.executeTask( task ).then( function( taskExecution )
                        {
                            currentTaskExecution = taskExecution;
                        } );
                    }
                }
            }
        } );
        if( found === false )
        {
            vscode.window.showErrorMessage( "Task not found: " + taskName );
            return false;
        }
    }

    context.subscriptions.push( vscode.tasks.onDidEndTask( function( endEvent )
    {
        log( "vscode.tasks.onDidEndTask " + endEvent.execution.task.name );

        currentTaskExecution = undefined;
        delete startedTasks[ endEvent.execution.task.name ];

        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'selectedTask' ) )
        {
            showSelectedTask();
        }
        else
        {
            busyIndicator.hide();
        }

        if( vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'showNotifications' ) === true )
        {
            vscode.window.showInformationMessage( "Task '" + endEvent.execution.task.name + "' finished" );
        }

        if( restartTask !== undefined )
        {
            log( "vscode.tasks.onDidEndTask: executing " + restartTask.name );
            vscode.tasks.executeTask( restartTask );
            restartTask = undefined;
        }
    } ) );

    context.subscriptions.push( vscode.tasks.onDidStartTask( function( startEvent )
    {
        log( "vscode.tasks.onDidStartTask " + startEvent.execution.task.name );

        currentTaskExecution = startEvent.execution;

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
            var workspaceFolder = vscode.workspace.getWorkspaceFolder( document.uri );
            if( workspaceFolder )
            {
                log( "vscode.workspace.onDidSaveTextDocument: " + document.fileName + " in workspace: " + workspaceFolder.name );
            }
            else
            {
                log( "vscode.workspace.onDidSaveTextDocument: " + document.fileName );
            }

            vscode.tasks.fetchTasks().then( function( availableTasks )
            {
                if( workspaceFolder )
                {
                    availableTasks = availableTasks.filter( function( task )
                    {
                        return task.scope.name === workspaceFolder.name;
                    } );
                }

                var tasks = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).tasks;

                function checkTask( taskName )
                {
                    var done = false;

                    tasks[ taskName ].map( function( glob )
                    {
                        if( done === false )
                        {
                            glob = expandGlob( glob, document.uri );

                            var filePath = path.isAbsolute( glob ) ? document.fileName : vscode.workspace.asRelativePath( document.fileName );

                            if( minimatch( filePath, glob, { matchBase: true } ) )
                            {
                                log( "vscode.workspace.onDidSaveTextDocument: match:" + glob );
                                var selectedTask = vscode.workspace.getConfiguration( 'triggerTaskOnSave' ).get( 'selectedTask' );
                                findAndRunTask( availableTasks, selectedTask ? selectedTask : taskName );
                                if( selectedTask )
                                {
                                    done = true;
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
        }
    } ) );

    context.subscriptions.push(
        vscode.commands.registerCommand( 'triggerTaskOnSave.enable', enable ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.disable', disable ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.toggle', toggle ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.selectTask', selectTask ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.clearSelectedTask', clearSelectedTask ),
        vscode.commands.registerCommand( 'triggerTaskOnSave.stopCurrentTask', stopCurrentTask )
    );

    context.subscriptions.push( busyIndicator );
    context.subscriptions.push( selectedTaskIndicator );

    showSelectedTask();
}

function deactivate()
{
    currentTaskExecution = undefined;
    restartTask = undefined;
}

exports.activate = activate;
exports.deactivate = deactivate;

//# sourceMappingURL=extension.js.map
