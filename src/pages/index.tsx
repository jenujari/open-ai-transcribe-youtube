import Container from '@mui/material/Container';
import Head from 'next/head';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { LoadingButton } from '@mui/lab';
import { TextField, Typography, Alert } from '@mui/material';
import { useCallback, useRef, useState } from 'react';

export default function Home() {

  const [url, setUrl] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>();

  const transcribeCb = useCallback(async () => {
    setLoader(true);
    setError("");
    const res = await fetch('api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ url, openAiKey }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const result = await res.json();

    if (result.isError) {
      setError(result.errorMessage)
    } else {
      if (textAreaRef.current) {
        textAreaRef.current.value = result.text;
        textAreaRef.current.focus();
      }
    }

    setLoader(false)

  }, [url, openAiKey, setLoader, setError]);

  return (
    <>
      <Head>
        <title>
          Transcribe Youtube
        </title>
      </Head>
      <Container style={{ minHeight: "calc(100vh - 56px)" }} >
        <Box sx={{ display: 'block', pt: "16px" }}>
          <Paper elevation={12} sx={{ py: "28px", px: "28px" }} >
            <Typography variant="h6" gutterBottom>
              Enter your youtube URL
            </Typography>
            {(error.length > 0) && (<Alert sx={{ mb: "28px" }} severity="error">{error}</Alert>)}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <TextField
                onChange={e => setUrl(e.target.value)} onBlur={e => setUrl(e.target.value)}
                value={url}
                id="youtube-url" label="Youtube URL" variant="outlined" sx={{ width: "100%", pb:"22px" }} />
              <TextField
                onChange={e => setOpenAiKey(e.target.value)} onBlur={e => setOpenAiKey(e.target.value)}
                value={openAiKey}
                id="open-ai-key" label="Open AI Key" variant="outlined" sx={{ width: "100%", pb:"22px" }} />
              <LoadingButton
                onClick={transcribeCb}
                loading={loader}
                type="button" variant="outlined">Transcribe</LoadingButton>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ display: 'block', pt: "48px" }}>
          <TextField
            id="outlined-multiline-static"
            label="Text From Open AI"
            multiline
            rows={18}
            defaultValue=""
            inputRef={textAreaRef}
            sx={{ width: '100%' }}
          />
        </Box>
      </Container>
    </>
  )
}
