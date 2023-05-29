import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { CONFIGURATION } from "../constant/webrtc";
import { send_answer, send_icecandidate } from "../api/socket";
import { socket } from "../api/socket";
import * as tmImage from "@teachablemachine/image";
import { metadataURL, modelURL } from "../constant/aiModel";
import Button from "../components/Button";

const ControllerPage = () => {
  const remoteVideoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [SitPercent, setSitPercent] = useState(null);
  const [model, setModel] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSit, setIsSit] = useState(false);
  const [isRunAway, setIsRunAway] = useState(false);

  const handleDiagnosisButtonClick = () => {
    setIsAiLoading(true);

    if (model) {
      setInterval(async () => {
        const prediction = await model.predict(remoteVideoRef.current);
        setIsSit(Math.round(prediction[1].probability) ? true : false);
        setSitPercent(prediction[1].probability ?? 0);
        setIsAiLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const peerConnection = new RTCPeerConnection(CONFIGURATION);

    const loadModel = async () => {
      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
    };

    loadModel();

    socket.on("offer", async (offer) => {
      console.log("서버로부터 offer를 수신하였습니다.");
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      send_answer(answer);
    });

    socket.on("icecandidate", (candidate) => {
      console.log("서버로부터 ICE candidate를 수신하였습니다.");

      const iceCandidate = new RTCIceCandidate(candidate);
      peerConnection.addIceCandidate(iceCandidate);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        send_icecandidate(event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.muted = true;
      remoteVideoRef.current.play();
      setIsVideoPlaying(true);
    };

    return () => {
      socket.off("offer");
      socket.off("icecandidate");
    };
  }, []);

  useEffect(() => {
    let timeoutId = null;

    if (!isSit) {
      timeoutId = setTimeout(() => {
        setIsRunAway(true);
      }, 5000);
    } else {
      setIsRunAway(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isSit]);

  return (
    <Container>
      <DataArea>
        <VideoArea>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </VideoArea>
        <Textarea>
          {SitPercent !== null && (
            <>
              <p>앉아있을 확률: {(SitPercent * 100).toFixed(2)}%</p>
              <p>비어있을 확률: {((1 - SitPercent) * 100).toFixed(2)}%</p>
            </>
          )}
          {isAiLoading && <p>AI 모델을 불러오는 중...</p>}
          {SitPercent && isRunAway && (
            <p style={{ color: "red" }}>좌석 발급자가 자리를 벗어났습니다.</p>
          )}
        </Textarea>
      </DataArea>
      {isVideoPlaying && model && SitPercent === null && (
        <Button text="진단시작" onClick={handleDiagnosisButtonClick} />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
`;

const DataArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const VideoArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20rem;
  height: 20rem;
  background-color: gray;

  video {
    width: 100%;
    height: 100%;
  }
`;

const Textarea = styled.div``;

export default ControllerPage;
