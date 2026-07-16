import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import server from "../environment.js";


const server_url = server;

import styles from "../styles/VideoComponent.module.css";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import CloseIcon from "@mui/icons-material/Close";

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(false);

  let [screenAvaliable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");
  let [newMessages, setNewMessges] = useState(10);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = async (stream) => {
    try {
      // window.localStream.getStream().forEach(track => track.stop())
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    // localVideoRef.current.srcObject = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      // connections[id].addStream(window.localStream);

      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          connections[id].addTrack(track, window.localStream);
        });
      }

      // connections[id].createOffer().then ( (description) =>{
      //     connections[id].setLocalDescription(description).then( () =>{
      //        socketRef.current.emit("signal" , id , JSON.stringify({"sdp" : connections[id].localDescription}))
      //     })
      //     .catch(e => console.log(e))
      // })

      try {
        const description = await connections[id].createOffer();

        await connections[id].setLocalDescription(description);

        socketRef.current.emit(
          "signal",
          id,
          JSON.stringify({
            sdp: connections[id].localDescription,
          }),
        );
      } catch (e) {
        console.log(e);
      }
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }
 
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
 
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = window.localStream;
          }
          for (let id in connections) {
            if (window.localStream) {
              window.localStream.getTracks().forEach((track) => {
                connections[id].addTrack(track, window.localStream);
              });
            }

            connections[id]
              .createOffer()
              .then((description) => {
                return connections[id].setLocalDescription(description);
              })
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({
                    sdp: connections[id].localDescription,
                  }),
                );
              })
              .catch((e) => console.log(e));
          }
        }),
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { ended: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess) // todo
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  useEffect(() => {
    console.log("Videos State:", videos);
  }, [videos]);

  // todo
  let gotMessageFromServer = async (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId === socketIdRef.current) return;

    if (!connections[fromId]) return;

    try {
      if (signal.sdp) {
        await connections[fromId].setRemoteDescription(
          new RTCSessionDescription(signal.sdp),
        );

        if (signal.sdp.type === "offer") {
          const description = await connections[fromId].createAnswer();

          await connections[fromId].setLocalDescription(description);

          socketRef.current.emit(
            "signal",
            fromId,
            JSON.stringify({
              sdp: connections[fromId].localDescription,
            }),
          );
        }
      }

      if (signal.ice) {
        await connections[fromId].addIceCandidate(
          new RTCIceCandidate(signal.ice),
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  // add message
  let addMessage = (data, sender , socketIdSender) => {
    setMessages((prevMessages) =>[ 
      ...prevMessages ,
      {sender : sender , data : data}
    ]);

    if(socketIdSender !== socketIdRef.current){
      setNewMessages((prevMessages) => prevMessages + 1)
    }
  };

  let connectToSocketServer = () => {
    // socketRef.current = io.connect(server_url , {secure :false});
    socketRef.current = io(server_url);
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        // todo
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );

          // ek dusre client se connection banaate hai ye ice protocol se
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          connections[socketListId].ontrack = (event) => {
            // add
            const remoteStream = event.streams[0];

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId,
            );

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: remoteStream }
                    : video,
                );

                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: remoteStream,
                autoPlay: true,
                playsInline: true,
              };

              // setVideos(videos =>{
              //     const updatedVideos = [...videos, newVideo];
              //     videoRef.current = updatedVideos;
              //     return updatedVideos;
              // })

              setVideos((videos) => {
                console.log(
                  "Before:",
                  videos.map((v) => v.socketId),
                );

                if (videos.some((v) => v.socketId === socketListId)) {
                  console.log("Duplicate socket:", socketListId);
                  return videos;
                }

                const updatedVideos = [...videos, newVideo];

                console.log(
                  "After:",
                  updatedVideos.map((v) => v.socketId),
                );

                videoRef.current = updatedVideos;

                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            // connections[socketListId].addStream(window.localStream);
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            // todo blackslience

            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();

            // connections[socketListId].addStream(window.localStream);

            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              // connections[id2].addStream(window.localStream);

              window.localStream.getTracks().forEach((track) => {
                connections[socketListId].addTrack(track, window.localStream);
              });
            } catch (e) {}

            // connections[id2].createOffer().then((description) =>{
            //     connections[id2].setLocalDescription(description)
            //     .then( () =>{
            //         socketRef.current.emit("signal" , id2 , JSON.stringify({"sdp" : connections[id2].localDescription }))
            //     })
            //     .catch((e) =>{
            //         console.log(e)
            //     })
            // })

            connections[id2]
              .createOffer()
              .then((description) => {
                return connections[id2].setLocalDescription(description);
              })
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({
                    sdp: connections[id2].localDescription,
                  }),
                );
              })
              .catch((e) => console.log(e));
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };


  let routeTo = useNavigate();

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () =>{
    setVideo(!video);
  }

  let handleAudio = () =>{
    setAudio(!audio);
  }

  let getDisplayMediaSuccess = (stream) =>{
    try{
      window.localStream.getTracks().forEach(track => track.stop())
    }catch(e) {console.log(e)}

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for(let id in connections){
      if(id === socketIdRef.current) continue;

      // connections[id].addStream(window.localStream)
      window.localStream.getTracks().forEach((track) => {
        connections[id].addTrack(track, window.localStream);
      });
      connections[id].createOffer().then((description) =>{
        connections[id].setLocalDescription(description)
        .then( () =>{
          socketRef.current.emit("signal" , id , JSON.stringify({"sdp" : connections[id].localDescription}))

        })
        .catch(e => console.log(e))
      })
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = window.localStream;
          }

          getUserMedia()
           
        }),
    );
  }
  let getDisplayMedia = () =>{
    if(screen) {
      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({video : true , audio :true})
        .then(getDisplayMediaSuccess)
        .then((stream) => { })
        .catch((e) => console.log(e));
      }
    }
  }

  useEffect(() =>{
    if(screen !== undefined){
      getDisplayMedia();
    }
  } , [screen])

  let handleScreen = () =>{
    setScreen(!screen);
  }

  let sendMessage = () =>{
    socketRef.current.emit("chat-message" , message , username);
    setMessage("")
  }

  let handleEndCall = () =>{
    try{
      let tracks =  localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop())
    }catch(e) {}

    routeTo("/home");
  }


  return (
    <div>
      {askForUsername === true ? (
        // <div>
        //   <h2>Enter Into Lobby </h2>
        //   <TextField
        //     id="outlined-basic"
        //     label="Username"
        //     value={username}
        //     onChange={(e) => setUsername(e.target.value)}
        //     variant="outlined"
        //   />

        //   <Button variant="contained" onClick={connect}>
        //     Connect
        //   </Button>

        //   <div>
        //     <video ref={localVideoRef} autoPlay muted></video>
        //   </div>
        // </div>

        <div className={styles.lobbyContainer}>
          <div className={styles.lobbyCard}>
            <h2>Enter Into Lobby</h2>

            <video
              className={styles.previewVideo}
              ref={localVideoRef}
              autoPlay
              muted
            />

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Button fullWidth variant="contained" onClick={connect}>
              Join Meeting
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <h2>Chat</h2>

                  <IconButton onClick={() => setModal(false)}>
                    <CloseIcon />
                  </IconButton>
                </div>

                <div className={styles.chattingDisplay}>
                  {messages.length > 0 ? (
                    messages.map((item, index) => {
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No messages Yet</p>
                  )}
                </div>
                <div className={styles.chattingArea}>
                  {/* {message} */}
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} className={styles.controlButton}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton
              onClick={handleEndCall}
              className={styles.endCallButton}
            >
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} className={styles.controlButton}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvaliable === true ? (
              <IconButton
                onClick={handleScreen}
                className={styles.controlButton}
              >
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <> </>
            )}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton
                onClick={() => setModal(!showModal)}
                className={styles.controlButton}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  autoPlay
                  playsInline
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
