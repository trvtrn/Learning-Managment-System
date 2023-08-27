import React, { useState } from 'react';
import {
  OutlinedInput,
  InputAdornment,
  IconButton,
  InputLabel,
  FormControl,
  Button,
  Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';

export default function SearchBar({ handleSearch, handleClear, errorMessage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClear, setShowClear] = useState(false);
  return (
    <>
      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <FormControl fullWidth>
          <InputLabel htmlFor="search">Search</InputLabel>
          <OutlinedInput
            id="search"
            label="Search"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            endAdornment={
              <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center' }}>
                {showClear && (
                  <Button
                    sx={{
                      minWidth: 0,
                      fontWeight: 'normal',
                      fontSize: '0.85rem',
                      padding: '0.5rem',
                      borderRadius: '5px',
                    }}
                    onClick={() => {
                      setSearchTerm('');
                      setShowClear(false);
                      handleClear();
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                <IconButton
                  type="submit"
                  aria-label="search"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowClear(true);
                    handleSearch(searchTerm);
                  }}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </form>
      {errorMessage && (
        <Alert severity="error" sx={{ marginBottom: '1rem' }}>
          {errorMessage}
        </Alert>
      )}
    </>
  );
}
