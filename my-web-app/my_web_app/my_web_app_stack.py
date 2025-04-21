from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3_deployment as s3deploy,
    aws_iam as iam,
    RemovalPolicy,
    CfnOutput
)
from constructs import Construct

class MyWebAppStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create an S3 bucket to host the website content
        website_bucket = s3.Bucket(
            self, "WebsiteBucket",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL
        )

        # Create CloudFront Origin Access Identity
        origin_access_identity = cloudfront.OriginAccessIdentity(
            self, "OriginAccessIdentity",
            comment="Access Identity for Website CloudFront Distribution"
        )
        
        # Grant read permissions to CloudFront
        website_bucket.grant_read(origin_access_identity)

        # Create CloudFront distribution
        distribution = cloudfront.Distribution(
            self, "Distribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(
                    website_bucket,
                    origin_access_identity=origin_access_identity
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED
            ),
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html"
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html"
                )
            ]
        )

        # Deploy site contents to S3
        s3deploy.BucketDeployment(
            self, "DeployWebsite",
            sources=[s3deploy.Source.asset("../../nodejs-aws-shop-react/dist")],  # Adjust this path to your build output
            destination_bucket=website_bucket,
            distribution=distribution,
            distribution_paths=["/*"]
        )

        # Update the eb_url to use a simpler domain format
        eb_domain = 'romax11425-cart-api-prod.eu-west-1.elasticbeanstalk.com'

        # Create CloudFront Distribution for API
        cart_distribution = cloudfront.Distribution(
            self, 'CartApiDistribution',
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.HttpOrigin(
                    eb_domain,
                    protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY,
                    origin_ssl_protocols=[cloudfront.OriginSslPolicy.TLS_V1_2]
                ),
                allowed_methods=cloudfront.AllowedMethods.ALLOW_ALL,
                cache_policy=cloudfront.CachePolicy.CACHING_DISABLED,
                origin_request_policy=cloudfront.OriginRequestPolicy.ALL_VIEWER,
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            ),
            enabled=True,
            price_class=cloudfront.PriceClass.PRICE_CLASS_100
        )

        # Update the eb_url to use a simpler domain format
        eb_domain = 'romax11425-bff-api-prod.eu-west-1.elasticbeanstalk.com'

        # Create CloudFront Distribution for API
        cart_distribution = cloudfront.Distribution(
            self, 'BFFApiDistribution',
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.HttpOrigin(
                    eb_domain,
                    protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY,
                    origin_ssl_protocols=[cloudfront.OriginSslPolicy.TLS_V1_2]
                ),
                allowed_methods=cloudfront.AllowedMethods.ALLOW_ALL,
                cache_policy=cloudfront.CachePolicy.CACHING_DISABLED,
                origin_request_policy=cloudfront.OriginRequestPolicy.ALL_VIEWER,
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            ),
            enabled=True,
            price_class=cloudfront.PriceClass.PRICE_CLASS_100
        )

        # Output CloudFront URLs with unique IDs
        CfnOutput(
            self, 'CartApiDistributionDomainName',  # Changed ID to be unique
            value=cart_distribution.distribution_domain_name,
            description='Cart API Distribution Domain Name'
        )

        CfnOutput(
            self, 'BFFApiDistributionDomainName',  # Changed ID to be unique
            value=cart_distribution.distribution_domain_name,
            description='BFF API Distribution Domain Name'
        )
        
        CfnOutput(
            self, "DistributionDomainName",
            value=distribution.distribution_domain_name,
            description="Website URL"
        )
