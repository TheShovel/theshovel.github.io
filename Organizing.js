class organizer {
    getInfo() {
      return {
        id: 'organizer',
        name: 'Organizer',
        blocks: [
          {
            opcode: 'blockGroup',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Group [Name]',
            arguments: {
                Name: {
                    type: Scratch.ArgumentType.STRING,
                    defaultValue: 'Group'
                }
            }
          }
        ]
      };
    }
  
    blockGroup() {
    }
  }
  
  Scratch.extensions.register(new organizer());