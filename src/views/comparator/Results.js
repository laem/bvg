import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { Flipper, Flipped } from 'react-flip-toolkit'

import TransportationContext from 'utils/TransportationContext'
import SearchContext from 'utils/SearchContext'

import Transportation from './results/Transportation'
import gares from '../../gares.json'
import { distance, point } from '@turf/turf'
import Emoji from 'components/base/Emoji'
import { Stations } from './Stations'

export const filledParam = (s) => s != null && s !== ''

const Wrapper = styled.div`
	flex: 1;
	position: relative;
	margin-bottom: 2rem;
`
export default function Results() {
	const {
		transportations,
		transportationsVisibles,
		transportationsAlwaysVisibles,
		carpool,
		uncertainty,
	} = useContext(TransportationContext)
	const { itinerary, setItinerary } = useContext(SearchContext)
	const [stationsFrom, setStationsFrom] = useState([])
	const [stationsTo, setStationsTo] = useState([])

	useEffect(() => {
		garesProches(gares, itinerary, 'from', setStationsFrom)
		garesProches(gares, itinerary, 'to', setStationsTo)
	}, [itinerary])

	console.log('ITINERARAY', itinerary)
	if (!itinerary.fromLatitude || itinerary.fromLatitude === '') {
		return (
			<div>
				<p></p>
				<h3>📍 Renseignez une adresse de départ.</h3>
				<br />
				<br />
				<p>
					<Emoji size="160%">🚧</Emoji> Attention, ceci n'est qu'une ébauche de
					projet.{' '}
				</p>
				<p>
					Rendez-vous sur{' '}
					<a href="https://github.com/laem/trainvelo/releases">
						{' '}
						github.com/laem/trainvelo
					</a>{' '}
					pour participer .
				</p>
			</div>
		)
	}
	if (
		filledParam(itinerary.fromLatitude) &&
		!filledParam(itinerary.fromStation) &&
		!itinerary.toLatitude
	) {
		return (
			<div>
				<h3>
					<Emoji e="🚉" /> Choissiez votre gare de départ
				</h3>
				<Stations
					gares={stationsFrom}
					count={6}
					onClick={(stationUIC) =>
						setItinerary({ ...itinerary, fromStation: stationUIC })
					}
				/>
			</div>
		)
	}

	console.log(
		filledParam(itinerary.fromLatitude),
		filledParam(itinerary.fromStation),
		!filledParam(itinerary.toLatitude)
	)

	if (
		filledParam(itinerary.fromLatitude) &&
		filledParam(itinerary.fromStation) &&
		!filledParam(itinerary.toLatitude)
	) {
		return (
			<div>
				<h3>📍 Saisissez votre adresse d'arrivée</h3>
			</div>
		)
	}

	if (
		filledParam(itinerary.fromLatitude) &&
		filledParam(itinerary.fromStation) &&
		filledParam(itinerary.toLatitude)
	) {
		return (
			<div>
				<h3>
					<Emoji e="🚉" /> Choissiez votre gare d'arrivée
				</h3>
				<Stations gares={stationsTo} count={3} searchTripsFor={itinerary} />
			</div>
		)
	}
}

const garesProches = (gares, itinerary, toOrFrom, then) => {
	const sortedStations = gares
		.map((gare) => ({
			...gare,
			distance: gareDistance(gare, itinerary, toOrFrom),
		}))
		.filter((gare) =>
			toOrFrom === 'to'
				? gare.distance > +itinerary.minBikeKm &&
				  gare.distance < +itinerary.maxBikeKm
				: true
		)
		.sort((g1, g2) => g1.distance - g2.distance)

	const tenStations = sortedStations.slice(0, 5)

	console.log(tenStations)

	Promise.all(
		tenStations.map(async (station) => {
			const bikeDistance = await computeBikeDistance(
				station.coordonnées.reverse(),
				[itinerary.fromLongitude, itinerary.fromLatitude]
			)

			return {
				...station,
				bikeDistance: bikeDistance?.features[0].properties['track-length'],
			}
		})
	).then((data) => then(data))

	then(tenStations)
}

const computeBikeDistance = (from, to) =>
	fetch(
		`https://brouter.phyks.me/brouter/brouter?lonlats=${from.join(
			','
		)}|${to.join(',')}&profile=phyks-trekking&alternativeidx=0&format=geojson`
	).then((res) => res.json())

const gareDistance = (station, itinerary, toOrFrom) => {
	const [lat, long] = station.coordonnées

	const attributeLong = toOrFrom + 'Longitude'
	const attributeLat = toOrFrom + 'Latitude'

	const A = point([
		Number(itinerary[attributeLong]),
		Number(itinerary[attributeLat]),
	])
	const B = point([long, lat])
	return distance(A, B)
}
