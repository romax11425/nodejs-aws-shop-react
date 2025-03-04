import aws_cdk as core
import aws_cdk.assertions as assertions

from my_web_app.my_web_app_stack import MyWebAppStack

# example tests. To run these tests, uncomment this file along with the example
# resource in my_web_app/my_web_app_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = MyWebAppStack(app, "my-web-app")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
