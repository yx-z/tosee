/*:
* @plugindesc change the y axis of choiceBox
* @param y
* @desc the y value
* @default Graphics.boxHeight / 2
*/

(function() {
    var params = PluginManager.parameters('ChangeChoiceY');
    var y = Number(params['y'] || (Graphics.boxHeight / 2));

    var ori = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function() {
        ori.call(this);
        this.y = y;
    }
})();
