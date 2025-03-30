import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class GutenbergStack extends cdk.Stack {
  public readonly bucketName: string;
  public readonly bucketUrl: string;
  public readonly apiUrl: string;
  public readonly distributionId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, 'GutenbergBucket', {
      bucketName: 'mc-gutenberg',
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    // Add bucket policy for public access
    const bucketPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
      principals: [new iam.AnyPrincipal()],
    });
    bucket.addToResourcePolicy(bucketPolicy);

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'GutenbergDistribution', {
      defaultBehavior: {
        origin: new origins.S3StaticWebsiteOrigin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
    });

    // Deploy React app build to S3
    new s3deploy.BucketDeployment(this, 'DeployReactApp', {
      sources: [s3deploy.Source.asset(path.join(__dirname, 'dist'))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Create Lambda function
    const handler = new lambda.Function(this, 'GutenbergHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      functionName: 'gutenberg-lambda',
      code: lambda.Code.fromAsset(path.join(__dirname, 'app'), {
        bundling: {
          user: 'root',
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash',
            '-c',
            [
              'cp package*.json /asset-output/',
              'cp *.ts /asset-output/',
              'cd /asset-output',
              'npm ci --production --no-audit',
              'npx esbuild --bundle index.ts --platform=node --target=node20 --outfile=index.js --external:aws-sdk',
              'rm -f *.ts',
            ].join(' && '),
          ],
        },
      }),
      memorySize: 256,
      timeout: cdk.Duration.minutes(1),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        OPENAI_API_KEY: 'obviouslyIamFake',
      },
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'GutenbergApi', {
      restApiName: 'Gutenberg API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // Create /books endpoint and bookId parameter
    const books = api.root.addResource('books');
    const book = books.addResource('{bookId}');

    // Add Lambda integration
    const booksIntegration = new apigateway.LambdaIntegration(handler);

    // Add methods to the /books/{bookId} endpoint
    book.addMethod('GET', booksIntegration);
    book.addMethod('POST', booksIntegration);

    // Export values
    this.bucketName = bucket.bucketName;
    this.bucketUrl = `https://${distribution.distributionDomainName}`;
    this.apiUrl = api.url;
    this.distributionId = distribution.distributionId;

    // Output values
    new cdk.CfnOutput(this, 'BucketName', { value: this.bucketName });
    new cdk.CfnOutput(this, 'CloudFrontUrl', { value: this.bucketUrl });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: this.distributionId });
    new cdk.CfnOutput(this, 'ApiUrl', { value: this.apiUrl });
    new cdk.CfnOutput(this, 'LambdaName', { value: handler.functionName });
  }
}

const app = new cdk.App();
new GutenbergStack(app, 'GutenbergStack');
app.synth();
