import styled from "styled-components";

export const MainButton = styled.button`
    margin: 1rem;
    margin-right: 2rem;
    border-radius: 12px;
    padding: 10px 24px;
    background-color: #b48608;
    color: #23394d;
    font-weight: bold;
    border: none;
    cursor: pointer;
    font-family: 'Montaga', serif;

    &:disabled{
        background-color: grey;
        cursor: default;
    }
    &:hover:enabled{
        transition: 0.5s all ease;
        color: white;
    }
`