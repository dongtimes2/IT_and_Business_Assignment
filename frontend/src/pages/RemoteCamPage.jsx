import styled from "styled-components";
import Button from "../components/Button";
import { CONFIGURATION } from "../constant/webrtc";
import { send_icecandidate, send_offer, socket } from "../api/socket";
import { useEffect } from "react";

const RemoteCamPage = () => {
  const peerConnection = new RTCPeerConnection(CONFIGURATION);

  const handleCameraVideoTransmit = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    send_offer(offer);
  };

  socket.on("answer", async (answer) => {
    console.log("서버로부터 answer를 수신하였습니다.");
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
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

  useEffect(() => {
    return () => {
      socket.off("answer");
      socket.off("icecandidate");
    };
  }, []);

  return (
    <Container>
      <Button text="송출하기" onClick={handleCameraVideoTransmit} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

export default RemoteCamPage;
