# Trigger Task on Save

Normally you would use a watch task to make something happen when a file changes, but sometimes you just need a task to run once on save. This extension lets you do that.

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave).

Alternatively, open Visual Studio code, press `Ctrl+P` or `Cmd+P` and type:

    > ext install triggertaskonsave

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/triggertaskonsave).

## Configuration

The extension can be temporarily enabled/disabled with:

```json
    "triggerTaskOnSave.on": true
```

Tasks can be associated with filename globs, e.g.

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

There is also an option restart the task if it is currently executing:

```json
    "triggerTaskOnSave.restart": true
````

This seems to work some of the time, but sometimes it will stop the task without starting it and sometimes it will display a message telling you to stop the task using F1.

The following commands are provided, which can be accessed from the command pallete, or bound to keys:

    triggerTaskOnSave.enable
    triggerTaskOnSave.disable
    triggerTaskOnSave.toggle

### Credits

This is my first extension and is loosely based on [Format On Save](https://marketplace.visualstudio.com/items?itemName=gyuha.format-on-save).
