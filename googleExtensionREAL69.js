class google {
    getInfo() {
      return {
        id: 'google',
        name: "JodieHasAShovel's Google",
        blocks: [
          {
            opcode: 'googleblock',
            blockType: Scratch.BlockType.REPORTER,
            text: "JodieHasAShovel's Google Block"
          }
        ]
      };
    }
  
    googleblock() {
        window.location.replace("https://www.google.com");
    }
  }
  
  Scratch.extensions.register(new google());