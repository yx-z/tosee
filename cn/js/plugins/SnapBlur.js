/*:
* @author 日月星辰
* @plugindesc 屏幕模糊
* @help
* 1. 在事件中显示图片 snap 即可获取全屏截图
* 2. 在事件中显示图片 blur 即可获取全屏截图并模糊
* 3. 在事件中使用插件指令： blurPart x y w h opacity id blurLevel
*    即可获取屏幕区域(x, y, w, h)的截图并模糊blurLevel次，设置透明度opacity并保存至id号图片
*
* @param blurLevel
* @desc blur指令的模糊等级，越高越糊。推荐范围[1, 5]
* @default 1
*/

(function() {
    var params = PluginManager.parameters("Blur");
    var globalBlurLevel = Number(params['blurLevel'] || 1);


    Sprite_Picture.prototype.loadBitmap = function() {
      if (this._pictureName === "snap") {
        this.bitmap = SceneManager.snap();
      } else if (this._pictureName === "blur" ){
        this.bitmap = SceneManager.snap();
        for (var i = 0; i < globalBlurLevel; i++) {
          this.bitmap.blur();
        }
      } else if (this._pictureName.startsWith("blurPart")) {
        var args = this._pictureName.split(",");
        var x = args[1];
        var y = args[2];
        var w = args[3];
        var h = args[4];
        var commandBlurLevel = args[5];
        this.bitmap = SceneManager.snapArea(x, y, w, h);
        for (var i = 0; i < commandBlurLevel; i++) {
          this.bitmap.blur();
        }
      } else {
        this.bitmap = ImageManager.loadPicture(this._pictureName);
      }
    };

    var alias_command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
      if (command === "blurPart") {
        var x = parseInt(args[0]);
        var y = parseInt(args[1]);
        var w = args[2];
        var h = args[3];
        var opacity = parseInt(args[4]);
        var id = parseInt(args[5]);
        var commandBlurLevel = args[6];

        $gameScreen.showPicture(id, `blurPart,${x},${y},${w},${h},${commandBlurLevel}`, 0, x, y, 100, 100, opacity, 0);
      } else if (command === "blurSurround") {
        var WIDTH = 1024;
        var HEIGHT = 576;
        var upMax = Math.round(HEIGHT / 2.5);
        $gameScreen.showPicture(1, `blurPart,0,0,${WIDTH},${upMax},1`, 0, 0, 0, 100, 100, 100, 0);
        $gameScreen.showPicture(2, `blurPart,0,0,${WIDTH},${upMax / 2},3`, 0, 0, 0, 100, 100, 255, 0);
        var downMin = HEIGHT - upMax;
        $gameScreen.showPicture(3, `blurPart,0,${downMin},${WIDTH},${upMax},1`, 0, 0, downMin, 100, 100, 100, 0);
        $gameScreen.showPicture(4, `blurPart,0,${downMin + upMax / 2},${WIDTH},${upMax / 2},3`, 0, 0, downMin + upMax / 2, 100, 100, 255, 0);
      }
      alias_command.call(this, command, args);
      return true;
    };

    SceneManager.snapArea = function(x, y, w, h) {
        return Bitmap.snapArea(this._scene, x, y, w, h);
    };

    Bitmap.snapArea = function(stage, x, y, w, h) {
      var width = Graphics.width;
      var height = Graphics.height;
      var bitmap = new Bitmap(w, h);
      var context = bitmap._context;
      var renderTexture = new PIXI.RenderTexture(width, height);

      if (stage) {
          renderTexture.render(stage);
          stage.worldTransform.identity();
      }

      if (Graphics.isWebGL()) {
          var gl =  renderTexture.renderer.gl;
          var webGLPixels = new Uint8Array(4 * width * height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, renderTexture.textureBuffer.frameBuffer);
          gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          var canvasData = context.getImageData(0, 0, width, height);
          canvasData.data.set(webGLPixels);
          context.putImageData(canvasData, 0, 0);
      } else {
          context.drawImage(renderTexture.textureBuffer.canvas, -x, -y);
      }

      bitmap._setDirty();
      return bitmap;
    }
})();
