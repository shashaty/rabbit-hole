// Alec Shashaty & Arzang Kasiri, 2019


// content script for making a preview panel for zooming in on images without opening a new link



let images = document.querySelectorAll('a.image'); // grab all images on the page


function createAndStyleFrames() {  
    for(let i = 0; i < images.length; i++) {
        
        // for each image, make an iframe to host the larger preview image
        let iframePreview = document.createElement('iframe'),
            iframeWidth = '500px',
            iframeHeight = '500px';
        
        iframePreview.src = images[i].href;
        iframePreview.width = iframeWidth;
        iframePreview.height = iframeHeight;
        iframePreview.style.position = 'absolute';
        iframePreview.style.display = 'none';
        iframePreview.style.right = '160px'; // TODO: implement a more responsive display for the preview

        // on iframe load,
        iframePreview.addEventListener('load', function firstLoad() {
            
            // grab the full image link from the loaded document
            let subDocument = iframePreview.contentDocument,
                documentBody = subDocument.querySelector('body'),
                fullImageLinkDiv = subDocument.querySelector('div.fullImageLink'),
                fullImageLink = fullImageLinkDiv.children[0].href;

            
            // wipe the iframe document body of all content for a clean slate
            while(documentBody.firstChild) {
                documentBody.removeChild(documentBody.firstChild);
            }
            
            // make a new image tag from the saved full image link and add it to the iframe
            // as its new sole element
            let newImageTag = document.createElement('img');
            newImageTag.src = fullImageLink;
            
            documentBody.style.position = 'relative';
            documentBody.style.height = '0';

            newImageTag.style.position = 'absolute';
            newImageTag.style.width = '100%';
            
            newImageTag.style.top = '0';
            newImageTag.style.left = '0';
            
            documentBody.appendChild(newImageTag);
            
            
            // on hover preview definition
            images[i].children[0].addEventListener('mouseover', () => {
                iframePreview.style.display = 'block';
                 
                // hacky way of resetting the iframe's height & width to match the 
                // size of the embedded image by grabbing the image's computed width & height
                iframePreview.width = String(newImageTag.offsetWidth) + 'px';
                iframePreview.height = String(newImageTag.offsetHeight) + 'px';
                 
            });
            
            images[i].children[0].addEventListener('mouseout', () => {
                iframePreview.style.display = 'none';
            });

           iframePreview.removeEventListener('load', firstLoad); 
            
        });

        // add iframe preview to the link's parent container
        images[i].parentNode.appendChild(iframePreview);
       
    }
}


// run the script
createAndStyleFrames();

