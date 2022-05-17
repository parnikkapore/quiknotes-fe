import { Image } from 'react-konva';
import React from 'react';
import * as pdfjs from 'pdfjs-dist/webpack';

export default class PDFPageContents extends React.Component {
  state = {
    image: null,
  };
  /*
  props = {
    url = <url>.
  }
  */
  
  componentDidMount() {
    this.loadImage(this.props.src);
  }
  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage(this.props.src);
    }
  }
  componentWillUnmount() {
  }
  
  loadImage(url) {
    // Asynchronous download of PDF
    const loadingTask = pdfjs.getDocument("/test1.pdf");
      loadingTask.promise.then((pdf) => {
        console.log('PDF loaded');
        
        // Fetch the first page
        const pageNumber = 1;
        pdf.getPage(pageNumber).then((page) => {
          console.log('Page loaded');
          
          const scale = 1.5;
          const viewport = page.getViewport({scale: scale});

          // Prepare canvas using PDF page dimensions
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          const renderTask = page.render(renderContext);
          renderTask.promise.then(() => {
            console.log('Page rendered');
            this.handleLoad(canvas)
          });
        });
      }, function (reason) {
        // PDF loading error
        console.error(reason);
      });
  }
  handleLoad = (src) => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    this.setState({
      image: src,
    });
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  };
  render() {
    return (
      <Image
        x={this.props.x}
        y={this.props.y}
        image={this.state.image}
      />
    );
  }
} 
