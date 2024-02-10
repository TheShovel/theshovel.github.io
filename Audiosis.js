(function(Scratch) {
    'use strict';
    let recordingElement = document.createElement("audio")
    recordingElement.volume = 0
    let recording = false
    let gotMicrophone = false

    let recordedChunks = []

    let recordedClips = []

    let recordingname = "Sample"

    class audiosis {
      getInfo () {
        return { 
            id: 'audiosis',
            name: 'Audiosis',
      
            blocks: [
              {
                opcode: 'requestMicInput',
                blockType: Scratch.BlockType.COMMAND,
                text: 'Request Microphone Input'
              },
              {
                opcode: 'getRecordedData',
                blockType: Scratch.BlockType.REPORTER,
                text: 'Microphone Data'
              },
              {
                opcode: 'setRecording',
                blockType: Scratch.BlockType.COMMAND,
                text: 'Turn recording [rec] with the clip name of [name]',
                arguments:{
                    rec:{
                        type: Scratch.ArgumentType.STRING,
                        menu: "OnOffMenu"
                    },
                    name:{
                      type: Scratch.ArgumentType.STRING,
                      defaultValue: "Audio Clip"
                    }
                }
              }
            ] ,
            menus: {
                OnOffMenu: {
                    acceptReporters: true,
                    items: ['true', "false"]
                  },
            }
        };
      }
      setRecording({rec,name}){
        if (rec == 'true'){
            recording = true;
            recordingname = name
        }
        else{
            recording = false
            new Promise( resolve=>{
              let reader = new FileReader();
              //convert to mp3
              let blob = new Blob(recordedChunks, {'type':'audio/mp3'})
              recordedClips.push({
                name:recordingname,
                data:reader.readAsDataURL(blob)
              })
            });
        }
      }

      requestMicInput({}){
        if (!gotMicrophone) {
            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
              }).then((mediaStream) => {
                const audio = recordingElement;
                audio.srcObject = mediaStream;
                audio.onloadedmetadata = () => {
                    gotMicrophone = true
                    console.log("Metadata Loaded")
                    audio.play();
                    const Recorder = new MediaRecorder(mediaStream ,{
                        audioBitsPerSecond : 48000});
                    Recorder.start(16);
                    Recorder.ondataavailable = (event) => {
                        if(recording){
                            console.log(event.data)
                            recordedChunks.push(event.data);
                        }
                    }
                };
            }).catch(function(error) {
                return error.name + " " + error.message;
            })
        }
      }
      getRecordedData({}) {
        
      }
    }
    Scratch.extensions.register(new audiosis());
  })(Scratch);