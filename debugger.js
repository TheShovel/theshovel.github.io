(function(Scratch) {
'use strict';
if (!Scratch.extensions.unsandboxed) {
throw new Error('The console has to run unsandboxed!');
}
var consolestate = "closed";
const debugbox = document.createElement("div");
box.id = "box";
document.body.appendChild(box);
class shoveldebugger {
getInfo() {
return {
id: 'shoveldebugger',
name: 'Console',
blocks: [
{
opcode: 'showconsole',
blockType: Scratch.BlockType.COMMAND,
text: 'Show console'
},
{
opcode: 'closeconsole',
blockType: Scratch.BlockType.COMMAND,
text: 'Close console'
},
]
};
}
showconsole() {
if (consolestate = "closed")
{
consolestate = "open";
console.log("Opened console");
}
}
closeconsole(){
if (consolestate = "open")
{
consolestate = "closed";
console.log("Closed console");
}
}
}
Scratch.extensions.register(new shoveldebugger());
})(Scratch);