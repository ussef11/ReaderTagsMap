/* eslint-disable no-unused-vars */
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
import loader from "./media/loader.gif"

import bac from "./media/bac.png"
import { authcontext } from "./helper/authcontext";



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
  const {userid, setUserid} = useContext(authcontext)
  const {username  , setUsername} = useContext(authcontext)
  const [Loader , setLoader]  = useState(false)
   
  const [selectedFile, setSelectedFile] = useState([]);
  const [  filesdata, setFiles] =  useState([])
  const  [countdata , setCountdata]  = useState(0)

  const handleFileChange = (e) => {
    const files = e.target.files;
    const filesArray = Array.from(files);
    // setSelectedFile(filesArray)
    //setSelectedFile((current) => [...current, filesArray]);
     setFiles((current) => [...current, filesArray]);
  };
  

//   function isArrayStructure1(arr) {
//     return Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object';
// }

// function isArrayStructure2(arr) {
//     return Array.isArray(arr) && arr.length === 1 && Array.isArray(arr[0]) && arr[0].length > 0 && typeof arr[0][0] === 'object';
// }

// // Example usage:
// const testArray1 = [{}, {}, {}];
// const testArray2 = [[{}, {}, {}]];

// console.log(isArrayStructure1(testArray1));  // Should return true
// console.log(isArrayStructure2(testArray2));  // Should return true






 useEffect(()=>{
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "frontend_lang=fr_FR");



    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    fetch(`http://192.168.100.50:5000/api/count`, requestOptions)
    .then(response => response.json())
    .then(result => setCountdata(result.data))
    .catch(error => console.log('error', error));

 },[messsage]) 






  useEffect(() => {
    console.log("filesdata" , filesdata)
    const flattenedFiles = filesdata.flatMap((x) => x);
    console.log(flattenedFiles);
    setSelectedFile(flattenedFiles)
  }, [filesdata]);

  const handleRemoveFile = (index) =>{
    const newFiles = [...filesdata];
    newFiles.splice(index, 1);
    const flattenedFiles = newFiles.flatMap((x) => x);
    setFiles(flattenedFiles);
  };

  
const handleUpload = () => {
  if (selectedFile) {
    const formData = new FormData();
    formData.append('image', selectedFile);

    fetch('http://192.168.100.50:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        alert(error)
      });
  } else {
    console.log('No file selected');
  }
};
const handlesubmit = async () => {
  try {
    if (typebac === "--SELECT TYPE BAC--" || typebac === null || typebac === undefined) {
      setmesssage({
        background: "red",
        message: "Type bac incorrect!",
        show: true,
      });
      setTimeout(() => {
        setmesssage({ show: false });
      }, 2000);
      return;
    }
    const formData = new FormData();
    for (const file of selectedFile) {
      formData.append('images', file);
    }
    formData.append('numparc', numParc);
    formData.append('lat', latLng.lat);
    formData.append('lng', latLng.lng);
    formData.append('ntag', ntag);
    formData.append('typebac', typebac);
    // formData.append('userid', userid);
    setLoader(true)
    const response = await fetch("http://192.168.100.50:5000/api/tag", {
      method: "POST",
      body: formData,
    })
    const result = await response.json();
    console.log(result);
    if (result.details) {
      setmesssage({
        background: "red",
        message: result.details.replace(/«[^»]+»/, ''),
        show: true,
      });
      setLoader(false)
    } else {
      setmesssage({
        background: "#36b700",
        message: result.message,
        show: true,
      });
      setLoader(false)
    }
    setTimeout(() => {
      setmesssage({ show: false });
    }, 2000);
  } catch (error) {
    console.error("Error:", error);
  }
};
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
    setLatlng({lat:event.latLng.lat(),lng:event.latLng.lng()})
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
  },[]);

  const onUnmount = React.useCallback(function callback(map){
    setMap(null);
  },[]);

  const [libraries] = useState(["places"]);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE",
    libraries,
    region: "MA",
  });
  const onLoad = useCallback(function callback(map){
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
  const handleRemoveMarker = () =>{
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
    anchor: new window.google.maps.Point(0, 0)}}/>
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
               onCloseClick={handleInfoWindowClose}>
               <div  style={{textAlign:'center'}}>
               <div style={{textAlign:"left"}}>  <button style={{background:"none" , border : "none"}} onClick={handleRemoveMarker}> <img  style={{width : "20px"}} src="https://img.icons8.com/?size=256&id=FgOBVsURv5ar&format=png" /> </button>   </div>
               <div className={`alert  ${messsage.show ? "" : 'hidden'} `} style={{background : messsage.background}}> <p> {messsage.message} </p>   </div>
               {/* <div style={{textAlign:'center'}} >  <h2  style={{margin:0}}  >Marker Information</h2> </div>  */}
               <div style={{textAlign:'center'}} > 
               
                <h3  style={{margin:0 }}  >Nombre de bacs relevés aujourd'hui: <span style={{color:"red"}}>  {countdata}  </span></h3> </div> 
                <div className="mydata">   
                <div  className="datadivfirst">    <p className="myp">Latitude:</p>  <p className="lat">{selectedMarker.position.lat.toFixed(10)}</p> </div> 
                <div className="datadiv">     <p className="myp">Longitude:</p>  <p className="lat"> {selectedMarker.position.lng.toFixed(10)}</p> </div> 
                <div className="datadiv">   <p className="myp">Numero de tag:</p>  <p className="ntag">{ntag}</p> </div> 
                </div>
                <div>          
                <select  value={typebac}  onChange={(e)=>{setTypebac(e.target.value)}} className="typebac">  
                <option> --SELECT TYPE BAC--</option>
                <option>B660</option>
                <option>  B360  </option>
                <option>  B770 </option>
                <option>  B770(Enterré) </option>
                <option>  COLONNE  </option>
                <option>Bac Galvalisé </option>
                <option>caisson</option>
               </select>  
                <input value={numParc}  onChange={(e)=>{setNumparc(e.target.value)}} className="parcimp" type="text" placeholder="Numero de parc" />
              </div>    
                <div className="file-input">
      <input  onChange={handleFileChange}  multiple    
        type="file"
        name="file-input"
        id="file-input"
        className="file-input__input"
        accept="image/*;capture=camera"
      />
      <label className="file-input__label" htmlFor="file-input">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="upload"
          className="svg-inline--fa fa-upload fa-w-16"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
          ></path>
        </svg>
        <span>Upload file</span>
        
        </label>

   
    </div>
                
    <div  className="imagesedit" style={{display :'flex'}}>  
{selectedFile && selectedFile.map((file, index) => (
        <div   className="itemimages"  id={index} key={index}>
            <div>  <button   onClick={() => handleRemoveFile(index)}>x</button></div>   
       <div>  <span>{  file.name.length > 5 ? `${file.name.slice(0, 5)}..` : file.name}</span>
 </div>
      
        </div>
      ))}     
         </div>     

                <button className="subbtn"  onClick={handlesubmit}>  {Loader ?     <img  className="loader" src={loader} alt="loader" />  : 'Submit'}     </button>

                {/* Submit */}
               
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
