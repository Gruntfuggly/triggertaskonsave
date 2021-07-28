# Trigger Task on Save

Normally you would use a watch task to make something happen when a file changes, but sometimes you just need a task to run once on save. This extension lets you do that.

When the task is running a status bar item is shown with the task name. Clicking this will stop the task.

*Note: This extension is for triggering vscode tasks, as defined in your `.vscode/tasks.json`*

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave).

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/triggertaskonsave).

## Configuration

Task names are associated with filename globs, e.g.

```json
    "triggerTaskOnSave.tasks": {
        "build": [
            "src/!ModuleVersion.h",
            "src/*.h",
            "src/*.cpp"
        ],
        "test": [
            "**-ut/*.h",
            "**-ut/*.cpp"
        ],
    }
```

Although VS Code tasks themselves are defined in *./.vscode/tasks.json*, you should
add the above to *settings.json*, since these are extension settings.
[This page](https://code.visualstudio.com/docs/getstarted/settings) explains
the places where extension settings are stored.

In the example above, the task **build** will be triggered when any *.h* or *.cpp* files, except for *ModuleVersion.h*, are saved in the *src* subfolder. The task **test** will be triggered when any *.h* or *.cpp* files are saved in any subfolders ending with *-ut*.

*Note: The array of globs for each task is processed in order and stops as soon as there is a match. Exclude globs (starting with* `!`*) should be specified first.*

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

A delay can be specified (in milliseconds) before triggering the task if you are experiencing problems with formatter timeouts, for example. If the task is re-triggered during the delay, the delay is reset.

```json
    "triggerTaskOnSave.delay": <delay>
```

There is also an option restart the task if it is currently executing:

```json
    "triggerTaskOnSave.restart": true
```

Notifications of tasks starting and ending can be enabled with:

```json
    "triggerTaskOnSave.showNotifications": true
```

If required, a status bar item allowing the extension to be enabled/disabled can be shown by setting this to true:

```json
    "triggerTaskOnSave.showStatusBarToggle": true
```

The extension can also be configured to highlight an area of the main window when a task is successful (returns an exit code of 0) or fails (returns a non-zero exit code). This works by overriding a value in your workspace settings. The override is cleared when the task is restarted. The colours are only overridden if defined, so you use either or both. _Note: If you have already set a value in your workspace settings, it will be lost._

This is configured using this example:

```json
    "triggerTaskOnSave.resultIndicator": "statusBar.background",
    "triggerTaskOnSave.failureColour": "#ff0000"
    "triggerTaskOnSave.successColour": "#00ff00"
```

The value of *resultIndicator* can be any of the workbench colour customizations (see <https://code.visualstudio.com/api/references/theme-color>).

The result indication is also cleared automatically after an interval. This can be changed by setting

```json
    "triggerTaskOnSave.resultIndicatorResetTimeout",
```

to the number of seconds required, or disabled by setting to 0.

## Commands

The following commands are provided, which can be accessed from the command palette (F1), or bound to keys:

```json
   triggerTaskOnSave.enable
   triggerTaskOnSave.disable
   triggerTaskOnSave.toggle
   triggerTaskOnSave.selectTask
   triggerTaskOnSave.clearSelectedTask
   triggerTaskOnSave.stopCurrentTask
```

## Known Issues

When restarting tasks, there may be a delay before the running task finishes and the task restarts. This is necessary to avoid an error that gets generated (see [issue 53331](https://github.com/Microsoft/vscode/issues/53331)). Hopefully when this issue is fixed, the delay will no longer be apparent.

### Credits

This is my first extension and is loosely based on [Format On Save](https://marketplace.visualstudio.com/items?itemName=gyuha.format-on-save).
