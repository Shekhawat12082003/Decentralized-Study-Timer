// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CampaignFactory {
    address[] public deployedCampaigns;

    event CampaignCreated(address campaignAddress, address creator);

    function createCampaign(string memory _title, string memory _description, uint _goal) public {
        Campaign newCampaign = new Campaign(msg.sender, _title, _description, _goal);
        deployedCampaigns.push(address(newCampaign));
        emit CampaignCreated(address(newCampaign), msg.sender);
    }

    function getAllCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Milestone {
        string description;
        uint amount;
        bool isApproved;
        uint voteCount;
        mapping(address => bool) voters;
        string[] studyLogs;
    }

    address public owner;
    string public title;
    string public description;
    uint public goal;
    uint public raisedAmount;
    uint public deadline;
    bool public isCompleted;

    mapping(address => uint) public contributions;
    address[] public contributors;

    Milestone[] public milestones;
    uint public currentMilestone;

    event ContributionReceived(address contributor, uint amount);
    event MilestoneCreated(string description, uint amount);
    event MilestoneApproved(uint milestoneIndex);
    event FundsWithdrawn(uint amount);
    event RefundIssued(address contributor, uint amount);
    event CampaignCompleted();
    event StudyLogSubmitted(uint milestoneIndex, string log);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier campaignNotCompleted() {
        require(!isCompleted, "Campaign already completed");
        _;
    }

    constructor(address _owner, string memory _title, string memory _description, uint _goal) {
        owner = _owner;
        title = _title;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + 30 days;
    }

    function contribute() public payable campaignNotCompleted {
        require(block.timestamp < deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        raisedAmount += msg.value;

        emit ContributionReceived(msg.sender, msg.value);
    }

    function createMilestone(string memory _description, uint _amount) public onlyOwner campaignNotCompleted {
        require(_amount <= address(this).balance, "Milestone amount exceeds available funds");
        Milestone storage milestone = milestones.push();
        milestone.description = _description;
        milestone.amount = _amount;
        milestone.isApproved = false;
        milestone.voteCount = 0;

        emit MilestoneCreated(_description, _amount);
    }

    function approveMilestone(uint _index) public campaignNotCompleted {
        require(contributions[msg.sender] > 0, "Only contributors can vote");
        require(_index < milestones.length, "Invalid milestone index");
        Milestone storage milestone = milestones[_index];
        require(!milestone.voters[msg.sender], "Already voted");

        milestone.voters[msg.sender] = true;
        milestone.voteCount++;

        if (milestone.voteCount > contributors.length / 2) {
            milestone.isApproved = true;
            emit MilestoneApproved(_index);
        }
    }

    function withdrawFunds(uint _index) public onlyOwner campaignNotCompleted {
        require(_index < milestones.length, "Invalid milestone index");
        Milestone storage milestone = milestones[_index];
        require(milestone.isApproved, "Milestone not approved");
        require(milestone.amount > 0, "No funds to withdraw");

        uint amount = milestone.amount;
        milestone.amount = 0;
        payable(owner).transfer(amount);

        emit FundsWithdrawn(amount);
    }

    function issueRefunds() public campaignNotCompleted {
        require(block.timestamp > deadline, "Campaign still active");
        require(raisedAmount < goal, "Funding goal was met");

        for (uint i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint amount = contributions[contributor];
            if (amount > 0) {
                contributions[contributor] = 0;
                payable(contributor).transfer(amount);
                emit RefundIssued(contributor, amount);
            }
        }
        isCompleted = true;
    }

    function markCampaignCompleted() public onlyOwner campaignNotCompleted {
        require(raisedAmount >= goal, "Goal not yet reached");
        isCompleted = true;
        emit CampaignCompleted();
    }

    function submitStudyLog(uint _milestoneIndex, string memory _log) public onlyOwner campaignNotCompleted {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        milestones[_milestoneIndex].studyLogs.push(_log);
        emit StudyLogSubmitted(_milestoneIndex, _log);
    }

    function getMilestoneLogs(uint _milestoneIndex) public view returns (string[] memory) {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        return milestones[_milestoneIndex].studyLogs;
    }

    function getMilestonesCount() public view returns (uint) {
        return milestones.length;
    }

    function getContributors() public view returns (address[] memory) {
        return contributors;
    }
}
