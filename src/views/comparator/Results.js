import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { Flipper, Flipped } from "react-flip-toolkit";

import TransportationContext from "utils/TransportationContext";
import SearchContext from "utils/SearchContext";

import Transportation from "./results/Transportation";
import gares from "../../gares.json";
import { distance, point } from "@turf/turf";
import Emoji from "components/base/Emoji";
import { Stations } from "./Stations";

const Wrapper = styled.div`
  flex: 1;
  position: relative;
  margin-bottom: 2rem;
`;
export default function Results() {
  const {
    transportations,
    transportationsVisibles,
    transportationsAlwaysVisibles,
    carpool,
    uncertainty,
  } = useContext(TransportationContext);
  const { itinerary, setItinerary } = useContext(SearchContext);

  console.log("ITI", itinerary);

  const garesTo = garesProches(gares, itinerary, "to");
  const garesFrom = garesProches(gares, itinerary, "from");
  console.log(garesFrom, garesTo);

  if (!itinerary.fromLatitude || itinerary.fromLatitude === "") {
    return (
      <div>
        <p>
          Renseignez un départ pour que l'on puisse choisir la gare de départ
        </p>
        <br />
        <br />
        <p>
          <Emoji size="160%">🚧</Emoji> Attention, ceci n'est qu'une ébauche de
          projet.{" "}
        </p>
        <p>
          Rendez-vous sur{" "}
          <a href="https://github.com/laem/trainvelo/releases">
            {" "}
            github.com/laem/trainvelo
          </a>{" "}
          pour participer .
        </p>
      </div>
    );
  }
  if (itinerary.fromLatitude && !itinerary.toLatitude) {
    return (
      <div>
        <h3>📍 Les gares à proximité du départ</h3>
        <Stations
          gares={garesFrom}
          count={6}
          onClick={(stationUIC) =>
            setItinerary({ ...itinerary, fromStation: stationUIC })
          }
        />
      </div>
    );
  }
  return (
    <Wrapper>
      <p>1️⃣ &nbsp;Voici les gares les plus proches</p>
      <h3>Départ</h3>

      <Stations gares={garesFrom} />
      <h3>Arrivée</h3>
      <Stations gares={garesTo} count={20} />
      <p>2️⃣ &nbsp;La suite n'est pas encore implémentée :)</p>
    </Wrapper>
  );
}

const garesProches = (gares, itinerary, toOrFrom) =>
  gares
    .map((gare) => ({
      ...gare,
      distance: gareDistance(gare, itinerary, toOrFrom),
    }))
    .filter((gare) => {
      return toOrFrom === "to"
        ? gare.distance > +itinerary.minBikeKm &&
            gare.distance < +itinerary.maxBikeKm
        : true;
    })
    .sort((g1, g2) => g1.distance - g2.distance);

const gareDistance = (station, itinerary, toOrFrom) => {
  const [lat, long] = station.coordonnées;

  const attributeLong = toOrFrom + "Longitude";
  const attributeLat = toOrFrom + "Latitude";

  const A = point([
    Number(itinerary[attributeLong]),
    Number(itinerary[attributeLat]),
  ]);
  const B = point([long, lat]);
  return distance(A, B);
};
