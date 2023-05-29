import styled from "styled-components";

const Button = ({ text, onClick }) => {
  const handleClick = () => {
    onClick && onClick();
  };

  return (
    <Wrapper type="button" onClick={handleClick}>
      <p>{text}</p>
    </Wrapper>
  );
};

const Wrapper = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
`;

export default Button;
