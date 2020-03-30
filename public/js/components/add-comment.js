Vue.component("my-add-comment", {
    template: "#add-comment",
    props: ["image"],
    data: function() {
        return {
            comment: "",
            username: ""
        };
    },
    methods: {
        postComment: function(e) {
            e.preventDefault();
            var self = this;
            console.log("image id: ", self.image.id);
            axios
                .post("/comment", {
                    comment: self.comment,
                    username: self.username,
                    imageId: self.image.id
                })
                .then(function(response) {
                    console.log("Comment posted successfully: ", response.data);
                    self.$emit("comment", response.data);
                })
                .catch(function(err) {
                    console.log("Error posting comment: ", err);
                });
        }
    }
});
