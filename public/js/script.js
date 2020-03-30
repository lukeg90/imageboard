(() => {
    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            maxImagesToAdd: 6,
            numImagesOnScreen: 6,
            showMoreButton: false,
            selectedImageId: location.hash.slice(1)
        },
        mounted: function() {
            var self = this;
            window.addEventListener("hashchange", function() {
                console.log("hash changed");
                self.selectedImageId = location.hash.slice(1);
            });
            console.log("my vue has mounted");
            axios
                .get("/images")
                .then(function(response) {
                    console.log("response data: ", response.data);
                    self.images = response.data;
                    if (self.images.length >= self.numImagesOnScreen) {
                        self.showMoreButton = true;
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        methods: {
            uploadImage: function(e) {
                let self = this;
                e.preventDefault();
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                axios
                    .post("/upload", formData)
                    .then(function(response) {
                        console.log("Response from POST /upload: ", response);
                        if (self.images.length >= self.numImagesOnScreen) {
                            self.images.pop(self.images[length - 1]);
                            self.showMoreButton = true;
                        }
                        self.images.unshift(response.data.rows[0]);
                        // reset form values
                        self.title = "";
                        self.description = "";
                        self.username = "";
                        self.file = null;
                    })
                    .catch(function(err) {
                        console.log("Error in POST /upload: ", err);
                    });
            },
            handleChange: function(e) {
                this.file = e.target.files[0];
                console.log("file: ", e.target.files[0]);
            },
            closeModal: function() {
                this.selectedImageId = null;
                history.replaceState(null, null, " ");
            },
            prevImage: function(id) {
                if (id != null) {
                    this.selectedImageId = id;
                }
            },
            nextImage: function(id) {
                if (id != null) {
                    this.selectedImageId = id;
                }
            },
            getMoreImages: function() {
                var self = this;
                // find smallest id of images on screen
                console.log("images: ", this.images);
                var smallestId = this.images[this.images.length - 1].id;
                // gets more images
                axios
                    .get(`/images/${smallestId}`)
                    .then(function(response) {
                        console.log(
                            "Successfully got more images, ",
                            response.data
                        );
                        self.images = self.images.concat(response.data);
                        self.numImagesOnScreen += self.maxImagesToAdd;
                        // if lowest ID appears on screen, hide the more button
                        for (var i = 0; i < response.data.length; i++) {
                            if (
                                response.data[i].id == response.data[i].lowestId
                            ) {
                                self.showMoreButton = false;
                            }
                        }
                    })
                    .catch(function(err) {
                        console.log("Error getting more images: ", err);
                    });
            }
        }
    });
})();
