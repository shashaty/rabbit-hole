// zoomImgOnHover.js
// Alec Shashaty & Arzang Kasiri, 2019
// content script for making a preview panel for zooming in on images without opening a new link

const exif = {loadImage:loadImage}; // loadImage library loaded in from manifest.json
main();

function main() {
    const images = document.querySelectorAll('a.image'); // grab all images on the page
    for(let i = 0; i < images.length; i++) {
        images[i].children[0].addEventListener('mouseover', () => {
            // has this image not been moused over before?
            if(images[i].parentNode.querySelectorAll('canvas.rhPreview').length === 0) {
                // turn global cursor into a loading bubble until the full image is rendered
                document.querySelector('html').classList.add('wait');
                // make the iframe
                iframeGen(images[i]);
            } else {
                // if it has, just display the preloaded preview image
                images[i].parentNode.querySelector('canvas.rhPreview').style.display = 'block';
            }
        });
    }
}


function iframeGen(image) {
    let iframePreview = document.createElement('iframe');
    iframePreview.src = image.href;
    iframePreview.style.display = 'none';
    
    // on iframe load,
    iframePreview.addEventListener('load', e => {iframeLoad(e,image)});

    // add iframe preview to the link's parent container
    image.parentNode.appendChild(iframePreview);
}

function iframeLoad(e, image) {
    let iframePreview = e.target;
    // grab the full image link from the loaded document
    let subDocument = iframePreview.contentDocument,
        documentBody = subDocument.querySelector('body'),
        fullImageLinkDiv = subDocument.querySelector('div.fullImageLink'),
        fullImageLink = fullImageLinkDiv.children[0].href;
    
    fetchImagePreview(image, fullImageLink);
    
    iframePreview.removeEventListener('load', iframeLoad); 
}

function fetchImagePreview(image, fullImageLink) {
    let newImageCSS = {
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'width': 'auto',
        'height': 'auto',
        'max-width': '500px',
        'max-height': '500px',
        'transform': 'translate(-50%,-50%)',
        'object-fit': 'contain'
    };
    
    exif.loadImage(
        fullImageLink,
        function (img) {
            if(img.type === "error") {
                console.log("Error loading image " + fullImageLink);
            } else {
                for(let i in newImageCSS) { img.style[i] = newImageCSS[i]; };
                img.classList.add('rhPreview');
                
                image.parentNode.appendChild(img);
                image.children[0].addEventListener('mouseout', () => {
                    img.style.display = 'none';
                });
            }
        },
        // fixing EXIF orientation...
        {orientation: true}
    );           
    document.querySelector('html').classList.remove('wait');
}