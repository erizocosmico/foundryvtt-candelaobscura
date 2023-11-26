# Candela Obscura system for FoundryVTT

Unofficial Foundry VTT system for Darrington Press' Candela Oscura roleplaying game.

### System development

**Note**: only Foundry 11 or later is supported.

If this is the first time doing it, copy the `system` folder to your Foundry `systems` folder renamed to `candelaobscura`.

Run `npm start` from this repository.

Open a browser to http://localhost:8080.

JavaScript and CSS is refreshed by Vite automatically, any changes inside the `system` folder need to be synced manually.

```
cp -R system/* <PATH TO YOUR FOUNDRY FOLDER>/Data/systems/candelaobscura/
```

### Roadmap

**Basics**

-   [ ] Circle sheet
-   [ ] Handle rolls for actions with 0 points better
-   [ ] Show objects in chat
-   [ ] Reroll on burning resistance

**Automation**

-   [ ] Automatically spending drives when rolling

### Credits

This work is based on the [Candela Obscura](https://darringtonpress.com/candela/) Roleplaying Game created by [Darrington Press](https://darringtonpress.com/).

### License

See [LICENSE](/LICENSE)
