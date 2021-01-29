import React, { useContext } from 'react'
import styled from 'styled-components'

import SearchContext from 'utils/SearchContext'

import Distance from './search/Distance'
import Itinerary from './search/Itinerary'
import Suggestion from './search/Suggestion'
import Select from './search/Select'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  padding: 8vh 0 ${(props) => (props.mode === 'itinerary' ? '2vh' : '6vh')};
  font-size: 2.5em;
  font-weight: 700;
`
const Start = styled.div``
const End = styled.div``
const Content = styled.div`
  position: relative;
  margin: 0 0.5em;
  font-weight: 800;
  color: ${(props) => props.theme.colors.main};

  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${(props) => props.theme.colors.main};
  }

  &:after {
    content: 'ˇ';
    position: absolute;
    top: calc(100% - 3px);
    right: 0.1em;
    font-size: 1.875rem;
    font-weight: 800;
    pointer-events: none;
  }
`
export default function Search() {
  const { mode } = useContext(SearchContext)

  return (
    <Wrapper mode={mode}>
      {mode === 'itinerary' ? (
        <Itinerary />
      ) : (
        <>
          <Start>Quand je</Start>
          <Content>
            {mode === 'distance' ? <Distance /> : <Suggestion />}
          </Content>
          <End>j'émets</End>
          <Select />
        </>
      )}
    </Wrapper>
  )
}
