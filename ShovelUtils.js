(function(Scratch) {
  console.log("ShovelUtils v1.1")
tempImageLoad = null
string = null;
output = null;
temp = null;
NSFWINFO = null;
SentDataUrl = null;
tempVAR = null;
memoryopen = 0;
R = null;
G = null;
B = null;
  const vm = Scratch.vm;
  vm.extensionManager.loadExtensionURL("http://localhost:8000/utilities.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/beta.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/files.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/runtime-options.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/CloudLinkWS.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/pointerlock.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/stretch.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/encoding.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/navigator.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/Cookie.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/cursor.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/penplus.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/cameracontrols.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/vars.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/profanity.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/discord.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/CanvasEffects.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/global-coordinate.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/numericalencoding.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/CommentBlocks.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/Time.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/MoreTimers.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/Cast.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/penPlus.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/clippingblending.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/LooksPlus.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/ColorPicker.js");
  vm.extensionManager.loadExtensionURL("http://localhost:8000/vars2.js")
  vm.extensionManager.loadExtensionURL("http://localhost:8000/upload.js")
  vm.extensionManager.loadExtensionURL("http://localhost:8000/LZ-String.js")
  vm.extensionManager.loadExtensionURL("http://localhost:8000/zip.js")
  vm.extensionManager.loadExtensionURL("http://localhost:8000/localstorage.js")
  'use strict';

  //Code from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
const timesF = [];
let fpsF;

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}



function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (timesF.length > 0 && timesF[0] <= now - 1000) {
      timesF.shift();
    }
    timesF.push(now);
    fpsF = timesF.length;
    refreshLoop();
  });
}
refreshLoop()

  const times = [];
  let fps = vm.runtime.frameLoop.framerate;
  const oldStep = vm.runtime._step;
  vm.runtime._step = function () {
    oldStep.call(this);
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
  };
  class ShovelUtils {
    getInfo () {
      return { 
        id: 'ShovelUtils',
        name: 'ShovelUtils',
        color1: '#f54242',
        color2: '#f54242',
        color3: '#f54242',
        blocks: [{
          opcode: 'importImage',
          blockType: Scratch.BlockType.COMMAND,
          text: "Import image from [TEXT] name [NAME]",
          arguments: {
           TEXT: {
             type: Scratch.ArgumentType.STRING,
             defaultValue: 'https://packager.turbowarp.org/assets/default-icon.290e09e569a1cab8e61ba93b0d23863f.png',
           },
           NAME: {
             type: Scratch.ArgumentType.STRING,
             defaultValue: 'Apple',
           }
         }
         },
         {
          opcode: 'getlist',
          blockType: Scratch.BlockType.REPORTER,
          text: "Get list [TEXT]",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '0',
            }
         }
         },
         {
          opcode: 'getUTime',
          blockType: Scratch.BlockType.REPORTER,
          text: "UTime",
         },
         {
          opcode: 'setlist',
          blockType: Scratch.BlockType.COMMAND,
          text: "Set list [NAME] to [TEXT]",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '0',
            },
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '0',
            }
         }
         },
         {
          opcode: 'importSprite',
          blockType: Scratch.BlockType.COMMAND,
          text: "Import sprite from [TEXT]",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '0',
            }
         }
         },
         {
          opcode: 'showmemory',
          blockType: Scratch.BlockType.COMMAND,
          text: "Show memory stats"
         },
         {
          opcode: 'importSound',
          blockType: Scratch.BlockType.COMMAND,
          text: "Import sound from [TEXT] name [NAME]",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://theshovel.github.io/kewlab-data/char%20edit.mp3',
            },
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Apple',
            }
         }
         },
         {
          opcode: 'importProject',
          blockType: Scratch.BlockType.COMMAND,
          text: "Import project from [TEXT]",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://theshovel.github.io/Bullet-Hell/Bullet Hell.sb3',
            }
         }
         },
         {
          opcode: 'loadExtension',
          blockType: Scratch.BlockType.COMMAND,
          text: "Load extension from [TEXT]",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://theshovel.github.io/utilities.js',
            }
         }
         },
         
         {
          opcode: 'restartProject',
          blockType: Scratch.BlockType.COMMAND,
          text: "Restart project",
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '0',
            }
         }
         },
         {
          opcode: 'setedtarget',
          blockType: Scratch.BlockType.COMMAND,
          text: "Set editing target to [NAME]",
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Sprite1',
            }
         }
         },
         
         {
          opcode: 'brightnessByColor',
          blockType: Scratch.BlockType.REPORTER,
          text: "Get brightness of [color]",
          arguments: {
            color: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '#ffffff',
            }
         }
         },
         

         {
          opcode: 'frameCosm',
          blockType: Scratch.BlockType.REPORTER,
          text: "[NAME][THING]",
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'NAME',
            },
            THING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '',
            }
         }
         },
         {
          opcode: 'getfps',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Fps'
        },
        {
          opcode: 'getfpsF',
          blockType: Scratch.BlockType.REPORTER,
          text: 'FpsF'
        },
        {
          opcode: 'alertBlock',
          blockType: Scratch.BlockType.COMMAND,
          text: 'alert [STRING]',
          arguments: {
            STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'A red spy is in the base!'
            }
          }
        },
        {
          opcode: 'inputPromptBlock',
          blockType: Scratch.BlockType.REPORTER,
          text: 'prompt [STRING]',
          disableMonitor: true,
          arguments: {
            STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'The code is 1, 1, 1.. err... 1!'
            }
          }
        },
        {
          opcode: 'confirmationBlock',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'confirm [STRING]',
          arguments: {
            STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Are you the red spy?'
            }
          }
        },
        {
          opcode: 'downloadURI',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Download [URI] name [NAME]',
          arguments: {
            STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Test'
            },
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Test'
            }
          }
        },
        {
          opcode: 'getblocksjson',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Get project Json',
        },
        {
          opcode: 'similarity',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Compare [s1] and [s2]',
          arguments: {
            s1: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Test'
            },
            s2: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Test2'
            }
          }
        },
        {
          opcode: 'snapshotStage',
          blockType: Scratch.BlockType.REPORTER,
          text: 'snapshot stage',
          disableMonitor: true
        },
        {
          opcode: 'uploadtext',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Upload [TEXT] with ID [ID]',
          arguments:{
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Test'
            },
            ID: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Test'
            }
          }
        },
        {
          opcode: 'seturlprovider',
          blockType: Scratch.BlockType.COMMAND,
          text: 'URL provider [URL]',
          arguments:{
            URL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Test'
            }
          }
        },
        {
          opcode: 'getuploadinfo',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Wastebin info',
          disableMonitor: true
        },
        {
          opcode: 'getR',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Get R',
          disableMonitor: true
        },
        {
          opcode: 'getG',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Get G',
          disableMonitor: true
        },
        {
          opcode: 'getB',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Get B',
          disableMonitor: true
        },
        {
          opcode: 'convrgb',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Convert [HEX] to RGB',
          arguments:{
            HEX: {
              type: Scratch.ArgumentType.COLOR,
            }
          }
        },
        {
          opcode: 'setClipboard',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set [STRING] to clipboard',
          arguments: {
            STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'apple',
            }
          }
        },
        {
          opcode: 'getIfNSFW',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Get NSFW info for [URL]',
          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '',
            }
          }
        },
        {
          opcode: 'genNSFWINFO',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Get NSFW API response'
        }
      ]
      }
    }


    importImage({TEXT,NAME}) {
      fetch(TEXT)
  .then((r) => r.arrayBuffer())
  .then((arrayBuffer) => {
    const storage = vm.runtime.storage;
    vm.addCostume(NAME+'.PNG', {
      name: NAME,
      asset: new storage.Asset(
        storage.AssetType.ImageBitmap,
        null, // asset id, doesn't need to be set here because of `true` at the end will make Scratch generate it for you
        storage.DataFormat.PNG,
        new Uint8Array(arrayBuffer),
        true
      )
    })
  });
  }

  frameCosm({THING,NAME}){
return THING
    }

importSprite ({TEXT}) {
  fetch(TEXT)
  .then(r => r.arrayBuffer())
  .then(buffer => vm.addSprite(buffer))
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.log("Error", error);
  });
}

importSound ({TEXT,NAME}) {
fetch(TEXT)
  .then((r) => r.arrayBuffer())
  .then((arrayBuffer) => {
    const storage = vm.runtime.storage;
    const asset = new storage.Asset(
      storage.AssetType.Sound,
      null,
      storage.DataFormat.MP3,
      new Uint8Array(arrayBuffer),
      true
    );
    vm.addSound({
      md5: NAME+'.mp3',
      asset: asset,
      name: NAME
    });
  });
}

importProject ({TEXT}) {
  fetch(TEXT)
  .then(r => r.arrayBuffer())
.then(buffer => vm.loadProject(buffer))
  .then(() => {
    console.log("Done");
    vm.greenFlag()
  })
  .catch((error) => {
    console.log("Error", error);
  });
}

restartProject(){
vm.greenFlag()
}

loadExtension({TEXT}){
  vm.extensionManager.loadExtensionURL(TEXT)
}

getlist({ TEXT }) {
  const list = vm.runtime.getTargetForStage().lookupVariableByNameAndType(TEXT, 'list');
  if (list) {
    return JSON.stringify(list.value);
  } else {
    return "";
  }
}
setlist({TEXT,NAME}){
  temp = JSON.parse(TEXT)
  vm.runtime.getTargetForStage().lookupVariableByNameAndType(NAME, 'list').value = temp
}

setedtarget({NAME}){
  vm.setEditingTarget(vm.runtime.getSpriteTargetByName(NAME).id); 
}

/**
 * Calculate brightness value by RGB or HEX color.
 * @param color (String) The color value in RGB or HEX (for example: #000000 || #000 || rgb(0,0,0) || rgba(0,0,0,0))
 * @returns (Number) The brightness value (dark) 0 ... 255 (light)
 */
brightnessByColor ({color}) {
  var color = "" + color, isHEX = color.indexOf("#") == 0, isRGB = color.indexOf("rgb") == 0;
  if (isHEX) {
    const hasFullSpec = color.length == 7;
    var m = color.substr(1).match(hasFullSpec ? /(\S{2})/g : /(\S{1})/g);
    if (m) var r = parseInt(m[0] + (hasFullSpec ? '' : m[0]), 16), g = parseInt(m[1] + (hasFullSpec ? '' : m[1]), 16), b = parseInt(m[2] + (hasFullSpec ? '' : m[2]), 16);
  }
  if (isRGB) {
    var m = color.match(/(\d+){3}/g);
    if (m) var r = m[0], g = m[1], b = m[2];
  }
  if (typeof r != "undefined") return ((r*299)+(g*587)+(b*114))/1000;
}

showmemory(){
  if(memoryopen == 0){
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})();
memoryopen = 1;
}
}
    getfps(){
      return fps;
}

getfpsF(){
  return fpsF;
}

alertBlock(args) {
  alert(args.STRING);
}

inputPromptBlock(args) {
  return prompt(args.STRING);
}

confirmationBlock(args) {
  if (confirm(args.STRING)) {
    return true;
  } else {
    return false;
  }
}
getUTime(){
  return Date. now()
}

downloadURI({URI, NAME}) {
  const link = document.createElement("a");
  link.href = URI;
  link.download = NAME;
  link.click();
}
getblocksjson({}){
  var func = eval('vm._saveProjectZip().files["project.json"]._data');
  return func;
}
similarity({s1, s2}) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

snapshotStage(args, util) {
  return new Promise(resolve => {
    Scratch.vm.runtime.renderer.requestSnapshot(uri => {
      resolve(uri);
    });
  });
}
uploadtext(args){
  fetch("https://corsproxy.io/?"+SentDataUrl, {
  method: "POST",
  body: JSON.stringify({
  "content": args.TEXT,
  "filename": btoa(Math.random()),
  "highlighting_language": "",
  "ephemeral": false,
  "expire_at": 0,
  "expire_in": 0,
  "date_created": 0,
  "id": args.ID
}),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
})
  .then((response) => response.json())
  .then((json) => output = JSON.stringify(json));
}

getuploadinfo(){
  return output;
}

convrgb(args){
  R = hexToRgb(args.HEX).r;
  G = hexToRgb(args.HEX).g;
  B = hexToRgb(args.HEX).b;
}


getR(){
  return R;
}
getG(){
  return G;
}
getB(){
  return B;
}
setClipboard(args) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(args.STRING);
  }
}
getIfNSFW(args) {
  NSFWINFO = '';
  const data = JSON.stringify({
    url: args.URL
  });
  
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  
  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
      NSFWINFO = this.responseText;
    }
  });
  
  xhr.open('POST', 'https://nsfw-images-detection-and-classification.p.rapidapi.com/adult-content');
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.setRequestHeader('X-RapidAPI-Key', '33aec59b92msh261f2ec0de44e3bp1364c6jsn65f63f8914ae');
  xhr.setRequestHeader('X-RapidAPI-Host', 'nsfw-images-detection-and-classification.p.rapidapi.com');
  
  xhr.send(data);
}

genNSFWINFO() {
  return NSFWINFO;
}

seturlprovider(args) {
  SentDataUrl = args.URL;
}

}


  Scratch.extensions.register(new ShovelUtils());
})(Scratch);
