import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CircularProgress, List, ListItem } from '@mui/material';
import MuiNextLink from '@components/MuiNextLink';
import CenterTitle from '@components/CenterTitle';
import axios from 'axios';
import { styled } from '@mui/system';
import theme from '@styles/theme';

const MarkdownList = styled(List)({
  listStyle: 'disc',
  listStylePosition: 'inside',
  padding: 0,
  marginBottom: '2rem',
});

const MarkdownListItem = styled(ListItem)({
  display: 'list-item',
  color: theme.palette.text.secondary,
  paddingTop: 0,
});

const Job = () => {
  const router = useRouter();
  const { job_id } = router.query;
  const [isLoading, setLoading] = useState(true);
  const [job, setJob] = useState({});

  useEffect(() => {
    const getJobDetails = async () => {
      try {
        const res = await axios.get(`${process.env.API_URL}/jobs/${job_id}`);
        setJob(res.data);
      } catch {
        setJob(null);
      }
      setLoading(false);
    };

    if (job_id) getJobDetails();
  }, [job_id]);

  const MultilineJobDescription = ({ description }) => {
    return (
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <Typography variant="h4" {...props} />,
          h2: ({ node, ...props }) => <Typography variant="h5" {...props} />,
          h3: ({ node, ...props }) => (
            <Typography
              variant="h6"
              sx={{ marginBottom: '0.2rem' }}
              {...props}
            />
          ),
          p: ({ node, ...props }) => <Typography variant="p" {...props} />,
          ul: ({ node, ...props }) => <MarkdownList {...props} />,
          li: ({ node, ...props }) => <MarkdownListItem {...props} />,
          a: ({ node, ...props }) => <MuiNextLink {...props} />,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {description}
      </ReactMarkdown>
    );
  };

  return (
    <>
      {job && !job.archived ? (
        <>
          <Container maxWidth="960px" sx={{ maxWidth: '960px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ mt: 5 }}>
              Careers
            </Typography>
          </Container>
          {isLoading && (
            <Container sx={{ mb: '3rem' }}>
              <CircularProgress
                size={24}
                sx={{
                  position: 'relative',
                  left: '50%',
                  marginLeft: '-12px',
                  marginTop: '120px',
                }}
              />
            </Container>
          )}
          {!isLoading && (
            <Container maxWidth="760px" sx={{ maxWidth: '760px', mx: 'auto' }}>
              <Typography variant="h2" sx={{ mt: 5 }}>
                {job.title}
              </Typography>
              <Typography variant="p">{job.shortDescription}</Typography>
              <Divider sx={{ width: '2rem', mb: '1.5rem' }} />
              {job.description && (
                <>
                  <Typography variant="h4" sx={{ mt: '2rem' }}>
                    Description
                  </Typography>
                  <MultilineJobDescription description={job.description} />
                </>
              )}
              <Typography variant="h4" sx={{ mt: '2rem' }}>
                Apply
              </Typography>
              <Typography variant="p">
                Join the{' '}
                <MuiNextLink
                  href="https://discord.gg/Ph9Wsw6v"
                  rel="noreferrer"
                  target="_blank"
                >
                  #development
                </MuiNextLink>{' '}
                channel today.
              </Typography>
            </Container>
          )}
        </>
      ) : (
        <CenterTitle
          title="Oops..."
          subtitle="Looks like the job id you are looking for doesn't exist or has already been archived."
          main={true}
        />
      )}
    </>
  );
};

export default Job;
