FROM nginx:1.27-alpine

# Railway provides $PORT at runtime; the nginx image renders templates with env vars on start.
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY index.html login.html config.js home.css home.js styles.css app.js /usr/share/nginx/html/

EXPOSE 8080
