import React from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';
import Axios from 'axios';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

const LOCATION = {
  lat: 0,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
    if ( !map ) return;

    let response;

    try {
      response = await Axios.get('https://corona.lmao.ninja/countries');
    } catch(e) {
      // if axios request fails console log
      console.log('E', e);
      return;
    }

    const { data = [] } = response;
    const hasData = Array.isArray(data) && data.length > 0;
    if ( !hasData ) return;

    const geoJson = {
      // define a geoJson document as a FeaturedCollection to better interface with Leaflet
      type: 'FeatureCollection',
      // map through data to get the country & countryInfo to create a map pin using lat long
      features: data.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        // add the country details to the properties of geoJson
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [ lng, lat ]
          }
        }
      })
    }

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      // allow custom map layer Leaflet creates for our map
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;

        const {
          country,
          updated,
          cases,
          deaths,
          recovered
        } = properties

        casesString = `${cases}`;

        // format the cases count to show 1k+ instead of 1000 and a formatted date instead of the timestamp
        if ( cases > 1000 ) {
          casesString = `${casesString.slice(0, -3)}k+`
        }
        if ( updated ) {
          updatedFormatted  = new Date(updated).toLocaleString();
        }

        // HTML string block which is used to define the map marker
        const html = `
          <span class=“icon-marker”>
            <span class=“icon-marker-tooltip”>
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed:</strong> ${cases}</li>
                <li><strong>Deaths:</strong> ${deaths}</li>
                <li><strong>Recovered:</strong> ${recovered}</li>
                <li><strong>Last Update:</strong> ${updatedFormatted}</li>
              </ul>
            </span>
            ${ casesString }
          </span>
        `;

        return L.marker( latlng, {
          icon: L.divIcon({
            className: 'icon',
            html
          }),
          // hover on a map marker and it will rise above the other markers
          riseOnHover: true
        });
      }
    });

    geoJsonLayers.addTo(map);
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings} />

      <Container type="content" className="text-center home-start">
        <h2>Want to see how this was made?</h2>
        <p>See the code here:</p>
        <a href="https://github.com/nickfp1985/covid19-map-practice" target="https://github.com/nickfp1985/covid19-map-practice">Github</a>
        <p className="note">Note: This Gatsby site is a work in progress.</p>
      </Container>
    </Layout>
  );
};

export default IndexPage;
