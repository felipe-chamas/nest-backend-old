resource "aws_subnet" "nat_gateway" {
  cidr_block = var.public_subnet_cidr_block
  vpc_id     = aws_vpc.custom_vpc.id
  tags = {
    Name = "${var.namespace}-${terraform.workspace}-nat-gw-subnet"
  }
}

resource "aws_internet_gateway" "nat_gateway" {
  vpc_id = aws_vpc.custom_vpc.id
  tags = {
    Name = "${var.namespace}-${terraform.workspace}-internet-gw"
  }
}

resource "aws_route_table" "nat_gateway" {
  vpc_id = aws_vpc.custom_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.nat_gateway.id
  }
}

resource "aws_route_table_association" "nat_gateway" {
  subnet_id      = aws_subnet.nat_gateway.id
  route_table_id = aws_route_table.nat_gateway.id
}

resource "aws_eip" "nat_gateway" {
  vpc = true
  tags = {
    Name = "${var.namespace}-${terraform.workspace}-eip-nat-gw"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_gateway.id
  subnet_id     = aws_subnet.nat_gateway.id
  tags = {
    Name = "${var.namespace}-${terraform.workspace}-nat-gw"
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.custom_vpc.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }
}

resource "aws_route_table_association" "public_route_table" {
  count = length(aws_subnet.private_subnet)

  subnet_id      = element(aws_subnet.private_subnet.*.id, count.index)
  route_table_id = aws_route_table.public_route_table.id
}

