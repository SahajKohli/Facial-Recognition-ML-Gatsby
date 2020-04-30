import React from "react"
import * as faceapi from 'face-api.js'
import Dropzone from 'react-dropzone';



export default class Index extends React.Component {

  state = {
    loading: true,
    isWill: false,
    isChad: false,
    file: null,
  }

  async componentDidMount(){
    console.log("hello");
    //console.log(faceapi.fetchImage('./static/willF.jpg'));
    await Promise.all([
      await faceapi.loadSsdMobilenetv1Model('./face_model/'),
      await faceapi.loadFaceLandmarkModel('./face_model'),
      await faceapi.loadFaceRecognitionModel('./face_model'),
    ]);

    this.setState({
      loading: false,
    });

  }

  async checkFace (file){

    if(!file){
    return;
  }
    const will = await faceapi.fetchImage('./willF.jpg');
    const chad = await faceapi.fetchImage('./chadS.jpg');
    const uploadImage = await faceapi.fetchImage(file);

    const willDescriptor = await faceapi.allFacesSsdMobilenetv1(will);
    const charDescriptor = await faceapi.allFacesSsdMobilenetv1(chad);
    const uploadDescriptor = await faceapi.allFacesSsdMobilenetv1(uploadImage)

    const willDistance = faceapi.euclideanDistance(willDescriptor[0].descriptor, uploadDescriptor[0].descriptor);
    const chadDistance = faceapi.euclideanDistance(charDescriptor[0].descriptor, uploadDescriptor[0].descriptor);


    console.log("hello");

    this.setState({
      loading: false,
      isWill : willDistance < 0.6,
      isChad : chadDistance < 0.6,
      file:file,
    });
  }

  render () {
    return (
      <div>
        {
          this.state.loading ? (
            <p>Loading......</p>
          ) : (
            <Dropzone onDrop={files =>
            {
              console.log(files);
              const file = files[0];
              const reader = new FileReader();

              reader.onload = () => {
                const fileAsBinaryString = reader.result;

                this.checkFace(fileAsBinaryString);
              };
              reader.readAsDataURL(file);
            }}>
              {({getRootProps, getInputProps}) => (
                <div className="container">
                  <div
                    {...getRootProps({
                      className: 'dropzone',
                      onDrop: event => event.stopPropagation()
                    })}
                  >
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files </p>
                  </div>
                </div>
              )}
            </Dropzone>
          )
        }
        {this.state.file && <img src ={this.state.file} alt="uploaded image"/>}
        <h2>This is {this.state.isWill ? 'Will' : '' } {this.state.isChad ? 'Chad': ''}{!this.state.isWill  && !this.state.isChad ? 'not either':''} </h2>

      </div>
    )
  }
}