Vue.component("my-modal", {
    template: "#modal",
    props: ["image-id"],
    data: function() {
        return {
            image: {},
            comments: []
        };
    },
    watch: {
        imageId: function() {
            this.getImageAndComments();
        }
    },
    mounted: function() {
        console.log("modal mounted");
        this.getImageAndComments();
    },
    methods: {
        getImageAndComments: function() {
            var self = this;
            axios
                .get(`/image/${self.imageId}`)
                .then(function(response) {
                    console.log("Successfully got image ", response);
                    self.image = response.data[0];
                    return axios.get(`/comments/${self.imageId}`);
                })
                .then(function(response) {
                    console.log("Successfully got comments: ", response);
                    self.comments = response.data;
                    console.log("comments: ", self.comments);
                })
                .catch(function(err) {
                    self.$emit("close");
                    console.log("Error getting images or comments: ", err);
                });
        },
        addComment: function(comment) {
            console.log("emitted comment event: ", comment);
            this.comments.unshift(comment[0]);
        },
        requestCloseModal: function() {
            this.$emit("close");
        }
        // emitPrev: function() {
        //     this.$emit("prev", this.image.prev_id);
        // },
        // emitNext: function() {
        //     this.$emit("next", this.image.next_id);
        // }
    }
});
