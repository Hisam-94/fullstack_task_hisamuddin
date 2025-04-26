This directory structure is for Vercel deployment.

To deploy this application on Vercel:

1. Create a new project on Vercel (vercel.com)
2. Link it to your GitHub repository
3. Configure the environment variables:
   - MONGO_URI=mongodb+srv://assignment_user:HCgEj5zv8Hxwa4xO@test-cluster.6f94f5o.mongodb.net/
   - MONGO_DB_NAME=Kazam
   - REDIS_HOST=redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com
   - REDIS_PORT=12675
   - REDIS_USERNAME=default
   - REDIS_PASSWORD=dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB
   - NODE_ENV=production

4. Deploy the application

Vercel will use the vercel.json configuration in the root directory to build and deploy the application. 