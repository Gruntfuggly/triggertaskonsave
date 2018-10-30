# Trigger Task on Save

Normally you would use a watch task to make something happen when a file changes, but sometimes you just need a task to run once on save. This extension lets you do that.

*Apology: The previous release was an attempt to add support for multiple workspaces, but on further testing, it appears that this can't work as intended, as there is no way to trigger a task in a specific workspace.*

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

## Known Issues

When restarting tasks, there may be a delay before the running task finishes and the task restarts. This is necessary to avoid an error that gets generated (see [issue 53331](https://github.com/Microsoft/vscode/issues/53331)). Hopefully when this issue is fixed, the delay will no longer be apparent.

### Credits

This is my first extension and is loosely based on [Format On Save](https://marketplace.visualstudio.com/items?itemName=gyuha.format-on-save).
