# Trigger Task on Save

Normally you would use a watch task to make something happen when a file changes, but sometimes you just need a task to run once on save. This extension lets you do that.

When the task is running a status bar item is shown with the task name. Clicking this will stop the task.

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave).

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/triggertaskonsave).

## Configuration

Tasks are associated with filename globs, e.g.

```json
    "triggerTaskOnSave.tasks": {
        "build": [
            "**/*.h"
            "**/*.cpp",
        ],
        "test": [
            "**-ut/*.h"
            "**-ut/*.cpp",
        ],
    }
```

Environment variables and the vscode variable `${workspaceFolder}` will be expanded in the glob patterns.

The target task can also be overridden. In this case, any of the globs that match will trigger the selected task instead. This allows a build task to be run when changing a file in a dependent folder, for example. The selected task can be set using the **Trigger Task On Save: Select Task** command or by setting:

```json
    "triggerTaskOnSave.selectedTask": <task name>
```

When a task has been selected, it is indicated on the status bar with a star. The selected task can be cleared by clicking the status bar item or using the command **Trigger Task On Save: Clear Selected Task**.

The extension can be temporarily enabled/disabled with:

```json
    "triggerTaskOnSave.on": true
```

There is also an option restart the task if it is currently executing:

```json
    "triggerTaskOnSave.restart": true
````

Notifications of tasks starting and ending can be enabled with:

```json
    "triggerTaskOnSave.showNotifications": true
````

The following commands are provided, which can be accessed from the command palette (F1), or bound to keys:

    triggerTaskOnSave.enable
    triggerTaskOnSave.disable
    triggerTaskOnSave.toggle
    triggerTaskOnSave.selectTask
    triggerTaskOnSave.clearSelectedTask
    triggerTaskOnSave.stopCurrentTask

## Known Issues

When restarting tasks, there may be a delay before the running task finishes and the task restarts. This is necessary to avoid an error that gets generated (see [issue 53331](https://github.com/Microsoft/vscode/issues/53331)). Hopefully when this issue is fixed, the delay will no longer be apparent.

### Credits

This is my first extension and is loosely based on [Format On Save](https://marketplace.visualstudio.com/items?itemName=gyuha.format-on-save).
