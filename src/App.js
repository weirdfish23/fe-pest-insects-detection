import AppBar from "@material-ui/core/AppBar";
import React, { useState } from "react";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ImageUpload from "image-upload-react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import "./App.css";
import Loader from "react-loader-spinner";
import axios from "axios";
import GetAppIcon from "@material-ui/icons/GetApp";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";

const width_img = 900;
const height_img = 650;
const url_example =
  "https://results-pest-detection.s3.amazonaws.com/imagenes_de_prueba.zip";

function LoadImage(props) {
  return (
    <div>
      <Grid container style={{ marginTop: "40px" }} justify="center">
        <Grid item>
          <ImageUpload
            handleImageSelect={props.handleImageSelect}
            imageSrc={props.imageSrc}
            setImageSrc={props.setImageSrc}
            style={{
              width: width_img,
              height: height_img,
              background: "gold",
            }}
          />
        </Grid>
      </Grid>
      <Grid
        container
        style={{ marginTop: "40px" }}
        justify="center"
        spacing={3}
      >
        <Grid item>
          <Button
            variant="contained"
            color="default"
            startIcon={<GetAppIcon />}
            onClick={() =>
              props.download_url(url_example, url_example.split("/")[-1])
            }
            download
          >
            Descargar imágenes de prueba
          </Button>
        </Grid>
        {props.loading ? (
          <Grid item style={{ width: "200px" }}>
            <Loader type="ThreeDots" color="#3f51b5" height={40} width={80} />
          </Grid>
        ) : (
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={props.processImage}
              disabled={props.loading}
            >
              Procesar imagen
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

function ShowResult(props) {
  return (
    <div>
      {props.url_result_img !== "" ? (
        <Grid container justify="center" style={{ marginTop: "40px" }}>
          <Grid item>
            <img
              style={{
                width: width_img,
                height: height_img,
              }}
              src={props.url_result_img}
              alt="detection result"
            />
          </Grid>

          <Grid
            container
            spacing={3}
            justify="center"
            style={{ marginTop: "20px" }}
          >
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<RotateLeftIcon />}
                onClick={() => {
                  props.setImageSrc(null);
                  props.setDone(false);
                  props.setImgFile(null);
                }}
              >
                Reiniciar
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="default"
                startIcon={<GetAppIcon />}
                onClick={() =>
                  props.download_url(
                    props.url_result_df,
                    props.url_result_df.split("/")[-1]
                  )
                }
              >
                Descargar etiquetado
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={() =>
                  props.download_url(
                    props.url_result_img,
                    props.url_result_img.split("/")[-1]
                  )
                }
              >
                Descargar imagen
              </Button>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <div />
      )}
    </div>
  );
}

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [imgFile, setImgFile] = useState();
  const [loading, setLoading] = useState(false);
  const [url_result_img, set_url_result_img] = useState("");
  const [url_result_df, set_url_result_df] = useState("");
  const [done, setDone] = useState(false);

  const handleImageSelect = (e) => {
    const imgURL = URL.createObjectURL(e.target.files[0]);
    console.log(imgURL);
    setImageSrc(imgURL);
    setImgFile(e.target.files[0]);
  };

  const processImage = () => {
    console.log("Start processing Image!");
    setLoading(true);
    const url_service = "http://52.54.65.208:8000/pest_detection";
    const formData = new FormData();
    formData.append("file", imgFile);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios
      .post(url_service, formData, config)
      .then((response) => {
        console.log(response.data);
        set_url_result_img(response.data.url_result_img);
        set_url_result_df(response.data.url_result_df);
        setLoading(false);
        setDone(true);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  };

  const download_url = (url, filename) => {
    // Create blob link to download

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode.removeChild(link);
  };

  return (
    <div className="App">
      <AppBar>
        <Toolbar>
          <Typography variant="h6">
            Detector de insectos plaga en trampas pegante
          </Typography>
        </Toolbar>
      </AppBar>
      <Typography style={{ marginTop: "100px" }} variant="h6">
        Carga una imagen de una trampa pegante
      </Typography>
      {done === false ? (
        <LoadImage
          handleImageSelect={handleImageSelect}
          imageSrc={imageSrc}
          setImageSrc={setImageSrc}
          download_url={download_url}
          processImage={processImage}
          loading={loading}
        />
      ) : (
        <ShowResult
          url_result_img={url_result_img}
          setImageSrc={setImageSrc}
          download_url={download_url}
          url_result_df={url_result_df}
          setDone={setDone}
          setImgFile={setImgFile}
        />
      )}
    </div>
  );
}

export default App;
