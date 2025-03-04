#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LambdaTsCdkStack } from "../lib/lambda-ts-cdk-stack";

const app = new cdk.App();
new LambdaTsCdkStack(app, "LambdaTsCdkStack", {
  selfHosted: Boolean(app.node.tryGetContext("selfHosted")),
  clusterId: app.node.getContext("clusterId"),
  authTokenSecretArn: app.node.getContext("authTokenSecretArn"),
});
