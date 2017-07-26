CREATE OR REPLACE FUNCTION get_lo_size(oid) RETURNS bigint
VOLATILE STRICT
LANGUAGE 'plpgsql'
AS $$
DECLARE
    fd integer;
    sz bigint;
BEGIN
    -- Open the LO; N.B. it needs to be in a transaction otherwise it will close immediately.
    -- Luckily a function invocation makes its own transaction if necessary.
    -- The mode x'40000'::int corresponds to the PostgreSQL LO mode INV_READ = 0x40000.
    fd := lo_open($1, x'40000'::int);
    -- Seek to the end.  2 = SEEK_END.
    PERFORM lo_lseek(fd, 0, 2);
    -- Fetch the current file position; since we're at the end, this is the size.
    sz := lo_tell(fd);
    -- Remember to close it, since the function may be called as part of a larger transaction.
    PERFORM lo_close(fd);
    -- Return the size.
    RETURN sz;
END;
$$;

CREATE TABLE blob_storage (
   guid   character(36)   NOT NULL   PRIMARY KEY,
   mime_type   character varying(127),
   content   oid
);

ALTER TABLE ONLY blob_storage ADD CONSTRAINT blob_storage_pkey PRIMARY KEY (guid);