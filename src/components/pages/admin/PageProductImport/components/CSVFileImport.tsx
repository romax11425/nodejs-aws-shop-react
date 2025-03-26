import React, { useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log('uploadFile to:', url);
    setFile(undefined);
  

    if (!file) {
      return;
    }

    const response = await axios({
      method: "GET",
      url,
      params: {
        name: encodeURIComponent(file.name),
      },
    });
    console.log("File to upload: ", file.name);
    console.log("Uploading to: ", response.data);
    const result = await fetch(response.data, {
      method: "PUT",
      body: file,
    });
    console.log("Result: ", result);
    setFile(undefined);
    
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <>
          <input
            hidden
            type="file"
            accept=".csv,.json"
            onChange={onFileChange}
            ref={uploadInputRef}
          />
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
          >
            Select File
          </Button>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button size="small" color="warning" variant="contained" onClick={removeFile}>
            Remove file
          </Button>
          <Button size="small" color="primary" variant="contained" onClick={uploadFile}>
            Upload file
          </Button>
        </div>
      )}
    </Box>
  );
}
