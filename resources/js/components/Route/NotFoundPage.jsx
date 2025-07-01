import React from 'react';
import styled, { keyframes } from 'styled-components';

const NotFoundPage = () => {
    return (
        <NotFoundContainer>
            <ImageContainer>
                <NotFoundImage src="/image/not_found.webp" alt="404 Page Not Found" />
            </ImageContainer>
            <TextContainer>
                <NotFoundHeading>Page Not Found</NotFoundHeading>
                <NotFoundDescription>Oops! The page you are looking for does not exist.</NotFoundDescription>
                <GoHomeButton style={{ marginTop: 10 }} href="/">Go to Home</GoHomeButton>
            </TextContainer>
        </NotFoundContainer>
    );
};

export default NotFoundPage;

// Animations
const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
`;

// Styled components
const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: #f8f8f8;
  animation: ${fadeIn} 1s ease-in-out;
`;

const ImageContainer = styled.div`
  max-width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const NotFoundImage = styled.img`
  width: 100%;
  max-width: 400px;
  animation: ${float} 3s ease-in-out infinite;
`;

const TextContainer = styled.div`
  max-width: 500px;
`;

const NotFoundHeading = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 10px;
  text-shadow: 2px 4px 6px rgba(0, 0, 0, 0.3); /* Adding shadow effect */

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const NotFoundDescription = styled.p`
  font-size: 1.2rem;
  color: #777;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const GoHomeButton = styled.a`
  text-decoration: none;
  background-color: #10d915;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1.2rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0db311;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 8px 16px;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 7px 14px;
  }
`;
