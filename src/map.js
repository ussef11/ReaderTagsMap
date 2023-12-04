import logo from "./logo.svg";
import "./App.css";
import {
  Marker,
  useJsApiLoader,
  GoogleMap,
  MarkerF,
  Autocomplete,
  DirectionsRenderer,
  Polygon,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import location from "./media/location.png"

import bac from "./media/bac.png"



function Map() {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  const [latLng , setLatlng]  = useState(null)
  const [markers, setMarkers] = useState([]);
  const [ntag   , setntag] = useState()
  const [typebac   , setTypebac] = useState()
  const  [numParc  , setNumparc]  = useState('')
  const  [err  , seterr]  = useState(false)
  const  [messsage  , setmesssage]  = useState({message : "" , background : ""  , show :false})


  

  const handlesubmit = ()=>{
    console.log("latitude"  , latLng)
 

    console.log( "ntag" , ntag)
    console.log( "typebac" , typebac)

    var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if(typebac == "--SELECT TYPE BAC--" || typebac == null ){
        setmesssage({ background : "red" , message: "Type bac incorrect !",  show :true })
        setTimeout(() => {
          setmesssage({show : false})
        }, 
        2000);
        return;

      }

      var raw = JSON.stringify({
        "numparc": numParc,
        "lat": latLng.lat,
        "lng":latLng.lng,
        "ntag": ntag,
        "typebac":typebac
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
        referrerPolicy: 'unsafe-url'
      };

      


      fetch("http://rabat.geodaki.com:5000/api/tag", requestOptions)
        .then(response => response.json())
        .then(result => {
          console.log(result)
          const regex = /«[^»]+»/;
          if(result.details){
            // console.log( "fffffff" , result.details)
            setmesssage({ background : "red" , message: result.details.replace(regex, '') ,  show :true })
            setTimeout(() => {
              setmesssage({show : false})
            }, 
            2000);
          
          }else{
            setmesssage({ background : "#36b700" , message: result.message ,  show :true })
            setTimeout(() => {
              setmesssage({show : false})
            }, 
            2000);
          }

          console.log(messsage)
        
        })
        .catch(error => 
          {
            console.log('error', error) 
        });
  }


  const handleMapClick = (event) => {
    setMarkers([])
    setLatlng(null)

    const newMarker = {
      id: new Date().getTime(),
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
    };
    setLatlng({lat :event.latLng.lat() , lng:event.latLng.lng()  })
    setMarkers([newMarker]);
  };
  const handleMarkerClick = (marker) => {
    console.log("Clicked marker:", marker);
    setSelectedMarker(marker);
  };


  useEffect(() => {

    const queryParams = new URLSearchParams(window.location.search);
    const ntagValue = queryParams.get("ntag");
    console.log("ntagValue:", ntagValue);
    setntag(ntagValue)


    


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position.coords.latitude);

          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        

          console.log("POS", position);
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const [libraries] = useState(["places"]);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE",
    libraries,
    region: "MA",
  });

  const onLoad = useCallback(function callback(map) {
    if (position) {
      const bounds = new window.google.maps.LatLngBounds(position);
      bounds.extend(new window.google.maps.LatLng(position));
      map.fitBounds(bounds);
      
    }
  }, [position]);

  const [selectedMarker, setSelectedMarker] = useState(null);




  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const handleRemoveMarker = () => {
    setMarkers(markers.filter((marker) => marker.id !== selectedMarker.id));
    setSelectedMarker(null);
  };

  return (
    <div className="mapcontainer">
      {isLoaded ? (
        <GoogleMap
    mapContainerStyle={{ width: "100%", height: "100vh" }}
    options={{
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: false,
  }}
    onClick={handleMapClick}
    center={position}
    zoom={18}  
    onUnmount={onUnmount}
    onLoad={onLoad}

    
>  




<Marker position={position}  icon={{url: location, 
    scaledSize: new window.google.maps.Size(30, 30), 
    origin: new window.google.maps.Point(0,0),
    anchor: new window.google.maps.Point(0, 0)}}    />


{markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => handleMarkerClick(marker)}
              icon={{url: bac, 
                scaledSize: new window.google.maps.Size(30, 30), 
                origin: new window.google.maps.Point(0,0),
                anchor: new window.google.maps.Point(0, 0)}}
              // draggable={true}
            />
          ))}
{selectedMarker && (
 
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={handleInfoWindowClose}
              
            >
               <div  style={{textAlign:'center'}}>



                <div style={{textAlign:"left"}}>  <button style={{background:"none" , border : "none"}} onClick={handleRemoveMarker}> <img  style={{width : "20px"}} src="https://img.icons8.com/?size=256&id=FgOBVsURv5ar&format=png" /> </button>   </div>
                <div className={`alert  ${messsage.show ? "" : 'hidden'} `} style={{background : messsage.background}}> <p> {messsage.message} </p>   </div>
                <div style={{textAlign:'center'}} >  <h2>Marker Information</h2> </div> 


                 <div className="mydata">   
                  <div  className="datadivfirst">    <p className="myp">Latitude:</p>  <p className="lat">{selectedMarker.position.lat.toFixed(10)}</p> </div> 
                <div className="datadiv">     <p className="myp">Longitude:</p>  <p className="lat"> {selectedMarker.position.lng.toFixed(10)}</p> </div> 
                <div className="datadiv">   <p className="myp">Numero de tag:</p>  <p className="ntag">{ntag}</p> </div> 
                <select  value={typebac}  onChange={(e)=>{setTypebac(e.target.value)}} className="typebac">  
                <option> --SELECT TYPE BAC--</option>
                <option>    B660</option>
                <option>  B360  </option>
                <option>  B770 </option>
                <option>  COLONNE  </option>
                <option>Bac Galvalisé </option>
               </select>
                </div>
              <div>     <input  value={numParc}  onChange={(e)=>{setNumparc(e.target.value)}} className="parcimp" type="text" placeholder="Numero de parc" />
              </div> 


                <button className="subbtn"  onClick={handlesubmit}> Submit </button>
               
              </div>
            </InfoWindow>
          )}
</GoogleMap>

      ) : (
        <> </>
      )}
    </div>
  );
}

export default Map;
