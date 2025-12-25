import { connect, disconnect, kill } from 'ngrok';
import 'dotenv/config';

const PORT = process.env.PORT || 8000;
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN;

(async () => {
  try {
    // Import the app so it starts (index.js runs connectDB and server.listen)
    await import('../index.js');

    // Small delay to allow server to be listening
    await new Promise((r) => setTimeout(r, 1000));

    console.log('Connecting to ngrok...');
    
    const url = await connect({
      addr: PORT,
      authtoken: NGROK_AUTHTOKEN,
      onStatusChange: (status) => {
        import 'dotenv/config';

        const PORT = process.env.PORT || 8000;
        const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN;

        // Helper to wait
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));

        (async () => {
          try {
            // Start the app (index.js runs connectDB and server.listen)
            await import('../index.js');

            // Small delay to allow server to be listening
            await wait(1000);
          
            console.log('Attempting to start ngrok (package) ...');

            // Try using the ngrok package first (supports v4 API)
            try {
              const ngrokModule = await import('ngrok');
              const ngrok = ngrokModule.default || ngrokModule;

              if (ngrok && typeof ngrok.connect === 'function') {
                // If authtoken is provided, try to set it (v4 has authtoken function)
                if (NGROK_AUTHTOKEN && typeof ngrok.authtoken === 'function') {
                  try {
                    await ngrok.authtoken(NGROK_AUTHTOKEN);
                  } catch (e) {
                    console.warn(
                      'Warning: failed to set ngrok authtoken via package:',
                      e.message || e
                    );
                  }
                }

                const url = await ngrok.connect({
                  addr: Number(PORT),
                  bind_tls: true,
                  authtoken: NGROK_AUTHTOKEN
                });

                console.log(`✓ ngrok tunnel established: ${url}`);
                console.log(`✓ Forwarding public traffic to http://localhost:${PORT}`);
                console.log(`✓ Your API base URL is: ${url}/api`);
                console.log('To stop the tunnel press CTRL+C');

                process.on('SIGINT', async () => {
                  console.log('\nShutting down ngrok...');
                  try {
                    if (typeof ngrok.disconnect === 'function') await ngrok.disconnect();
                    if (typeof ngrok.kill === 'function') await ngrok.kill();
                  } catch (e) {}
                  process.exit(0);
                });

                return;
              }
            } catch (pkgErr) {
              console.warn(
                'ngrok package method failed:',
                pkgErr && (pkgErr.message || pkgErr)
              );
            }

            // Fallback: try launching ngrok CLI via npx and parse stdout for the public URL
            console.log(
              'Falling back to ngrok CLI (npx). Make sure ngrok is installed or available via npx.'
            );

            const { spawn } = await import('child_process');

            const args = ['ngrok', 'http', String(PORT)];
            if (NGROK_AUTHTOKEN) {
              args.push('--authtoken', NGROK_AUTHTOKEN);
            }

            const child = spawn('npx', args, { shell: true });

            let stdoutBuffer = '';
            child.stdout.on('data', (chunk) => {
              const s = chunk.toString();
              process.stdout.write(s);
              stdoutBuffer += s;

              const match = stdoutBuffer.match(/Forwarding\s+(https?:\/\/[^\s]+)/i);
              if (match) {
                const publicUrl = match[1].trim();
                console.log(`\n✓ ngrok tunnel established (CLI): ${publicUrl}`);
                console.log(`✓ Forwarding public traffic to http://localhost:${PORT}`);
                console.log(`✓ Your API base URL is: ${publicUrl}/api`);
              }
            });

            child.stderr.on('data', (chunk) => {
              process.stderr.write(chunk.toString());
            });

            child.on('exit', (code, signal) => {
              console.log(`ngrok CLI exited with code=${code} signal=${signal}`);
              process.exit(code === null ? 0 : code);
            });

            process.on('SIGINT', () => {
              console.log('\nShutting down ngrok CLI...');
              try {
                child.kill();
              } catch (e) {}
              process.exit(0);
            });
          } catch (err) {
            console.error(
              'Failed to create ngrok tunnel:',
              err && (err.message || err)
            );
            process.exit(1);
          }
        })();
      }
    });

  } catch (err) {
    console.error('Ngrok connection failed:', err);
    process.exit(1);
  }
})();
