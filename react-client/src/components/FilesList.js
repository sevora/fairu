import { Component } from 'react';

export default class FilesList extends Component {
    constructor(properties) {
        super(properties);

        this.state = {
            filename: '',
            description: '',
            tags: [],
            filetype: '',
            downloadURLs: [],
            uploadedBy: ''
        }
    }

    render() {
        return (
            <div>Hey Welcome to file list!!!</div>
        )
    }
}
