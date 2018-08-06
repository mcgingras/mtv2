## MIXI x Mad Tatter

IDEO CoLab Brief - Sketch to Search

Using AI to augment the design process when creating a novel tattoo.


# Directory Structure

When a user is satisfied with a photo and wants to send it for GANification, it is saved to a directory called inputData, inside a folder named after it's timestamp. Then, it needs to be preprocessed for the GAN model, so it is preprocessed and then saved to a directory called images/inputs. From here, the GAN does it's work, then saves the final result in a folder within the public/imgs folder so it can be hosted back on the client. This directory is named after the same timestamp. This is done so each picture can be saved without having to delete each one.
